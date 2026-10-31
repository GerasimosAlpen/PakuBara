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

    const alert = mockStore.alerts.find((a) => a.id === verified.alert_id);
    const node = mockStore.nodes.find((n) => n.id === verified.node_id);

    if (!alert || !node) {
      return NextResponse.json(
        { error: { code: "not_found", message: "Data alert atau titik tidak ditemukan" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      alert_id: alert.id,
      node_id: node.id,
      status: alert.status,
      level: alert.level,
      location: { lat: node.lat, lon: node.lon },
      area_name: "Blok B Pulau Padang",
      readings: node.last_reading,
      prediction: alert.snapshot.prediction,
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

