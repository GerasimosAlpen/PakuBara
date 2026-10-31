import { NextRequest, NextResponse } from "next/server";
import { demoScenarioSchema } from "@/lib/validators/schemas";
import { getScenario } from "@/lib/simulator/scenarios";
import { mockStore } from "@/lib/mock-store";
import {
  formatEmergencyAlertMessage,
  sendWhatsAppMessage,
} from "@/lib/integrations/fonnte";
import { generateAlertToken } from "@/lib/alerts/token";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = demoScenarioSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_payload",
            message: "Format skenario demo tidak valid",
            details: result.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { scenario: scenarioType, target_phone } = result.data;
    const scenario = getScenario(scenarioType);

    // Apply last step immediately for fast demo response
    const finalStep = scenario.steps[scenario.steps.length - 1];

    for (const r of finalStep.readings) {
      const node = mockStore.nodes.find((n) => n.id === r.nodeId);
      if (node) {
        if (r.t20 !== undefined || r.t50 !== undefined || r.t100 !== undefined) {
          node.last_reading = {
            t20: r.t20 ?? node.last_reading.t20,
            t50: r.t50 ?? node.last_reading.t50,
            t100: r.t100 ?? node.last_reading.t100,
          };
        }
        if (r.coPpm !== undefined) {
          node.last_reading.co = r.coPpm;
        }
        if (r.battMv !== undefined) {
          node.batt_mv = r.battMv;
        }
        node.status = finalStep.expectedStatus;
        node.last_seen = r.measuredAt;

        mockStore.readings.push({
          id: Date.now() + Math.random(),
          node_id: r.nodeId,
          seq: r.seq,
          measured_at: r.measuredAt,
          t20: r.t20,
          t50: r.t50,
          t100: r.t100,
          co_ppm: r.coPpm,
          batt_mv: r.battMv,
          rssi: r.rssi,
        });
      }
    }

    let alertCreatedId: string | null = null;
    let whatsappSent = false;

    if (finalStep.shouldTriggerAlert) {
      const targetNode = mockStore.nodes.find((n) => n.id === scenario.targetNodeId);
      if (targetNode) {
        targetNode.status = "active";
        alertCreatedId = `al-demo-${Date.now()}`;

        mockStore.alerts.unshift({
          id: alertCreatedId,
          org_id: targetNode.org_id,
          node_id: targetNode.id,
          area_id: targetNode.area_id,
          level: "active",
          signals: { temp_trend: true, neighbor: true, co: true },
          snapshot: {
            t50: targetNode.last_reading.t50 || 87.3,
            co_ppm: 185,
            rate: 6.0,
            eta: 11.9,
            direction: "Timur Laut (45°)",
            ember_depth_cm: 50,
          },
          status: "open",
          created_at: new Date().toISOString(),
        });

        // Send WhatsApp if phone provided or to default target
        const recipient = target_phone || process.env.FONNTE_DEFAULT_TARGET;
        if (recipient) {
          const token = await generateAlertToken({
            alert_id: alertCreatedId,
            node_id: targetNode.id,
            org_id: targetNode.org_id,
          });

          const msg = formatEmergencyAlertMessage({
            areaName: "Blok B Pulau Padang",
            nodeId: targetNode.id,
            lat: targetNode.lat,
            lon: targetNode.lon,
            depthCm: 50,
            tempC: targetNode.last_reading.t50 || 87.3,
            rateCPerHour: 6.0,
            directionText: "Timur Laut (45°)",
            targetNeighborId: "PK-05",
            etaSurfaceHours: 11.9,
            waterRecommendationLiters: 120,
            alertToken: token,
          });

          const res = await sendWhatsAppMessage(recipient, msg);
          whatsappSent = res.success;
        }
      }
    }

    return NextResponse.json({
      success: true,
      scenario: scenario.name,
      description: scenario.description,
      final_status: finalStep.expectedStatus,
      alert_id: alertCreatedId,
      whatsapp_sent: whatsappSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/demo/scenarios error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal menjalankan skenario simulator" } },
      { status: 500 }
    );
  }
}

