import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = mockStore.alerts.find((a) => a.id === id);

    if (!alert) {
      return NextResponse.json(
        { error: { code: "not_found", message: `Alert ${id} tidak ditemukan` } },
        { status: 404 }
      );
    }

    if (alert.status !== "open") {
      return NextResponse.json(
        { error: { code: "conflict", message: `Alert sudah berada dalam status ${alert.status}` } },
        { status: 409 }
      );
    }

    alert.status = "acknowledged";
    alert.acknowledged_at = new Date().toISOString();

    // Log action automatically
    mockStore.actions.unshift({
      id: `ac-${Date.now()}`,
      org_id: alert.org_id,
      alert_id: alert.id,
      node_id: alert.node_id,
      kind: "inspection",
      note: "Regu pemadam mengonfirmasi penerimaan tugas peringatan dan bergerak menuju lokasi.",
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("POST /api/alerts/[id]/acknowledge error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengakui alert" } },
      { status: 500 }
    );
  }
}

