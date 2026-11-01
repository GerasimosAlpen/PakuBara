import { NextRequest, NextResponse } from "next/server";
import { verifyAlertToken } from "@/lib/alerts/token";
import { mockStore } from "@/lib/mock-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const verified = await verifyAlertToken(token);

    if (!verified) {
      return NextResponse.json(
        { error: { code: "unauthorized", message: "Tautan alert tidak valid atau sudah kedaluwarsa (24 jam)" } },
        { status: 401 }
      );
    }

    const alert =
      mockStore.alerts.find((a) => a.id === verified.alert_id) ||
      mockStore.alerts.find((a) => a.node_id === verified.node_id) ||
      mockStore.alerts[0];

    const node =
      mockStore.nodes.find((n) => n.id === verified.node_id) ||
      (alert ? mockStore.nodes.find((n) => n.id === alert.node_id) : null) ||
      mockStore.nodes[0];

    if (!alert || !node) {
      return NextResponse.json(
        { success: false, error: "Data alert atau titik tidak ditemukan" },
        { status: 404 }
      );
    }

    const area = mockStore.areas.find((a) => a.id === alert.area_id) || {
      name: "KHG Pulau Padang (Blok B)",
    };

    const snapshot = alert.snapshot || {};
    const depthCm = (snapshot.ember_depth_cm as number) || 50;
    const direction = (snapshot.direction as string) || "Timur Laut (45°)";
    const etaHours = (snapshot.eta as number) || 11.9;

    const dataPayload = {
      alert: {
        id: alert.id,
        level: alert.level,
        node_id: alert.node_id,
        area_id: alert.area_id,
        status: alert.status,
        created_at: alert.created_at,
        snapshot: {
          t50: (snapshot.t50 as number) || node.last_reading?.t50 || 87.3,
          co_ppm: (snapshot.co_ppm as number) || 185,
          rate: (snapshot.rate as number) || 6.0,
          eta: etaHours,
          direction: direction,
          ember_depth_cm: depthCm,
        },
      },
      node: {
        id: node.id,
        lat: node.lat,
        lon: node.lon,
        status: node.status,
      },
      area: {
        name: area.name,
      },
      recommended_actions: {
        water_liters: 850,
        nozzle_depth_cm: depthCm,
        direction: direction,
        eta_hours: etaHours,
      },
    };

    return NextResponse.json({
      success: true,
      data: dataPayload,
      // Backward compatibility fields
      alert_id: alert.id,
      node_id: node.id,
      status: alert.status,
      level: alert.level,
      location: { lat: node.lat, lon: node.lon },
      area_name: area.name,
      readings: node.last_reading,
      prediction: (alert.snapshot as any)?.prediction,
      signals: alert.signals,
      created_at: alert.created_at,
    });
  } catch (error) {
    console.error("GET /api/public/alerts/[token] error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal memuat data alert" } },
      { status: 500 }
    );
  }
}

