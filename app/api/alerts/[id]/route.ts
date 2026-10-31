import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET(
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

    const node = mockStore.nodes.find((n) => n.id === alert.node_id);
    const relatedActions = mockStore.actions.filter((ac) => ac.alert_id === alert.id);

    return NextResponse.json({
      ...alert,
      node,
      actions: relatedActions,
    });
  } catch (error) {
    console.error("GET /api/alerts/[id] error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil detail alert" } },
      { status: 500 }
    );
  }
}

