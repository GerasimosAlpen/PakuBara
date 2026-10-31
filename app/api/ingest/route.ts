import { NextRequest, NextResponse } from "next/server";
import { ingestBatchSchema } from "@/lib/validators/schemas";
import { prisma } from "@/lib/prisma";
import { mockStore } from "@/lib/mock-store";
import { evaluateSignals } from "@/lib/alerts/engine";
import { calculateSpreadPrediction } from "@/lib/predict/spread";
import {
  formatEmergencyAlertMessage,
  sendWhatsAppMessage,
} from "@/lib/integrations/fonnte";
import { generateAlertToken } from "@/lib/alerts/token";

export async function POST(req: NextRequest) {
  try {
    // Gateway Authentication & Authorization Check
    const gatewayKey =
      req.headers.get("x-gateway-key") ||
      req.headers.get("authorization")?.replace("Bearer ", "");
    const configuredGatewaySecret =
      process.env.GATEWAY_SECRET || "gw-pakubara-lora-posko-2026";

    if (!gatewayKey || gatewayKey !== configuredGatewaySecret) {
      return NextResponse.json(
        {
          error: {
            code: "unauthorized_gateway",
            message: "Kunci otentikasi gateway tidak valid atau tidak disertakan",
          },
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = ingestBatchSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_payload",
            message: "Format payload telemetri tidak valid",
            details: parseResult.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { gateway_id, readings } = parseResult.data;
    const alertsCreated: string[] = [];
    let accepted = 0;
    const duplicates = 0;
    const rejected: string[] = [];

    for (const item of readings) {
      const nodeStrId = item.node <= 100 ? `PK-${String(item.node).padStart(2, "0")}` : `GS-${String(item.node - 100).padStart(2, "0")}`;
      
      // Update in-memory mock store
      const mockNode = mockStore.nodes.find((n) => n.id === nodeStrId);
      if (mockNode) {
        if (item.t20 !== undefined || item.t50 !== undefined || item.t100 !== undefined) {
          mockNode.last_reading = {
            t20: item.t20 ?? mockNode.last_reading.t20,
            t50: item.t50 ?? mockNode.last_reading.t50,
            t100: item.t100 ?? mockNode.last_reading.t100,
          };
        }
        if (item.co !== undefined) {
          mockNode.last_reading.co = item.co ?? mockNode.last_reading.co;
        }
        if (item.batt_mv) mockNode.batt_mv = item.batt_mv;
        if (item.rssi) mockNode.rssi = item.rssi;
        mockNode.last_seen = item.measured_at;

        // Push reading
        mockStore.readings.push({
          id: Date.now() + accepted,
          node_id: nodeStrId,
          seq: item.seq,
          measured_at: item.measured_at,
          t20: item.t20,
          t50: item.t50,
          t100: item.t100,
          co_ppm: item.co,
          batt_mv: item.batt_mv,
          rssi: item.rssi,
          snr: item.snr,
        });

        // Evaluate signals if it's a temperature probe
        if (mockNode.type === "probe") {
          const maxTemp = Math.max(
            mockNode.last_reading.t20 || 0,
            mockNode.last_reading.t50 || 0,
            mockNode.last_reading.t100 || 0
          );

          // Find closest gas sensor
          const closestGas = mockStore.nodes.find((n) => n.type === "gas");
          const gasCo = closestGas?.last_reading.co || 15.0;

          // Find neighbors
          const otherProbes = mockStore.nodes.filter(
            (n) => n.type === "probe" && n.id !== mockNode.id
          );

          const neighborStates = otherProbes.map((n) => ({
            nodeId: n.id,
            distanceMeters: 45, // default cluster distance
            tempRatePerHour: n.status === "active" || n.status === "watch" ? 2.5 : 0.2,
          }));

          const evalResult = evaluateSignals(
            {
              nodeId: mockNode.id,
              type: "probe",
              currentTemp: maxTemp,
              tempRatePerHour: maxTemp > 50 ? 5.8 : 0.4,
              rSquared: 0.88,
              dataPointCount: 12,
              lastSeen: new Date(item.measured_at),
              installedAt: new Date(Date.now() - 7 * 86400000),
              status: mockNode.status,
            },
            neighborStates,
            closestGas
              ? [
                  {
                    nodeId: closestGas.id,
                    distanceMeters: 55,
                    currentCoPpm: gasCo,
                    coMedian24h: 22.0,
                    coStdDev24h: 6.0,
                    installedAt: new Date(Date.now() - 7 * 86400000),
                  },
                ]
              : []
          );

          mockNode.status = evalResult.newStatus;

          if (evalResult.isEmberActive) {
            // Check if open alert already exists
            const existingAlert = mockStore.alerts.find(
              (a) => a.node_id === mockNode.id && ["open", "acknowledged", "in_progress"].includes(a.status)
            );

            if (!existingAlert) {
              const newAlertId = `al-${Date.now()}`;
              const prediction = calculateSpreadPrediction(
                {
                  lat: mockNode.lat,
                  lon: mockNode.lon,
                  t20: mockNode.last_reading.t20 || 30,
                  t50: mockNode.last_reading.t50 || 30,
                  t100: mockNode.last_reading.t100 || 30,
                  r20: 1.2,
                  r50: 6.0,
                  r100: 0.5,
                },
                otherProbes.map((p) => ({
                  id: p.id,
                  lat: p.lat,
                  lon: p.lon,
                  rateOfChange: p.id === "PK-05" ? 2.5 : 0.1,
                  lastTemp: p.last_reading.t50 || 30,
                }))
              );

              mockStore.alerts.unshift({
                id: newAlertId,
                org_id: mockNode.org_id,
                node_id: mockNode.id,
                area_id: mockNode.area_id,
                level: "active",
                signals: {
                  temp_trend: evalResult.s1TempTrend,
                  neighbor: evalResult.s2Neighbor,
                  co: evalResult.s3GasCo,
                },
                snapshot: {
                  t20: mockNode.last_reading.t20,
                  t50: mockNode.last_reading.t50,
                  t100: mockNode.last_reading.t100,
                  co_ppm: gasCo,
                  prediction,
                  reason: evalResult.reason,
                },
                status: "open",
                created_at: new Date().toISOString(),
              });

              alertsCreated.push(newAlertId);

              // Dispatch WhatsApp asynchronously
              generateAlertToken({
                alert_id: newAlertId,
                node_id: mockNode.id,
                org_id: mockNode.org_id,
              }).then((token) => {
                const message = formatEmergencyAlertMessage({
                  areaName: "Blok B Pulau Padang",
                  nodeId: mockNode.id,
                  lat: mockNode.lat,
                  lon: mockNode.lon,
                  depthCm: prediction.emberDepthCm,
                  tempC: maxTemp,
                  rateCPerHour: 6.0,
                  directionText: prediction.directionText,
                  targetNeighborId: prediction.targetNeighborId,
                  etaSurfaceHours: prediction.etaSurfaceHours,
                  waterRecommendationLiters: prediction.waterRecommendationLiters,
                  alertToken: token,
                });

                sendWhatsAppMessage(process.env.FONNTE_DEFAULT_TARGET || "", message);
              });
            }
          }
        }
      }

      accepted++;
    }

    return NextResponse.json({
      accepted,
      duplicates,
      rejected,
      alerts_created: alertsCreated,
      commands_pending: 0,
    });
  } catch (error) {
    console.error("Telemetry ingestion error:", error);
    return NextResponse.json(
      {
        error: {
          code: "internal_error",
          message: "Galat saat memproses data telemetri",
        },
      },
      { status: 500 }
    );
  }
}

