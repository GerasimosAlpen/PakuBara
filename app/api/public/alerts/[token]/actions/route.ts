import { NextRequest, NextResponse } from "next/server";
import { verifyAlertToken } from "@/lib/alerts/token";
import { mockStore } from "@/lib/mock-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const verified = await verifyAlertToken(token);

    if (!verified) {
      return NextResponse.json(
        { error: { code: "unauthorized", message: "Tautan alert tidak valid atau kedaluwarsa" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { kind, water_liters, depth_cm, note, photo_url } = body;

    const newAction = {
      id: `ac-${Date.now()}`,
      org_id: verified.org_id,
      alert_id: verified.alert_id,
      node_id: verified.node_id,
      kind: kind || "injection",
      water_liters: water_liters || 0,
      depth_cm: depth_cm || 50,
      note: note || "Tindakan dicatat oleh regu via tautan WhatsApp",
      photo_url: photo_url || null,
      created_at: new Date().toISOString(),
    };

    mockStore.actions.unshift(newAction);

    // Update alert status
    const alert = mockStore.alerts.find((a) => a.id === verified.alert_id);
    if (alert && alert.status !== "resolved") {
      alert.status = "in_progress";
    }

    return NextResponse.json({ success: true, data: newAction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/public/alerts/[token]/actions error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mencatat tindakan dari tautan WhatsApp" } },
      { status: 500 }
    );
  }
}

