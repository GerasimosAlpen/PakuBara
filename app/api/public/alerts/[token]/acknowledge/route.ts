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

    const alert =
      mockStore.alerts.find((a) => a.id === verified.alert_id) ||
      mockStore.alerts.find((a) => a.node_id === verified.node_id) ||
      mockStore.alerts[0];

    if (!alert) {
      return NextResponse.json(
        { error: { code: "not_found", message: "Alert tidak ditemukan" } },
        { status: 404 }
      );
    }

    alert.status = "acknowledged";
    alert.acknowledged_at = new Date().toISOString();

    mockStore.actions.unshift({
      id: `ac-${Date.now()}`,
      org_id: alert.org_id,
      alert_id: alert.id,
      node_id: alert.node_id,
      kind: "inspection",
      note: "Petugas lapangan mengonfirmasi sedang menuju koordinat dari tautan WhatsApp.",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, status: alert.status });
  } catch (error) {
    console.error("POST /api/public/alerts/[token]/acknowledge error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal memproses konfirmasi menuju lokasi" } },
      { status: 500 }
    );
  }
}

