import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import { createActionSchema } from "@/lib/validators/schemas";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get("node_id");
  const alertId = searchParams.get("alert_id");

  try {
    let actions = [...mockStore.actions];

    if (nodeId) {
      actions = actions.filter((a) => a.node_id === nodeId);
    }
    if (alertId) {
      actions = actions.filter((a) => a.alert_id === alertId);
    }

    return NextResponse.json({
      data: actions,
      total: actions.length,
    });
  } catch (error) {
    if ((error as any)?.digest?.startsWith("NEXT_")) {
      throw error;
    }
    console.error("GET /api/actions error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil log tindakan" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_payload",
            message: "Format data pencatatan tindakan tidak valid",
            details: result.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { org_id, alert_id, node_id, kind, water_liters, depth_cm, note, photo_url } =
      result.data;

    const newAction = {
      id: `ac-${Date.now()}`,
      org_id,
      alert_id: alert_id || null,
      node_id: node_id || null,
      kind,
      water_liters: water_liters || 0,
      depth_cm: depth_cm || 50,
      note: note || "",
      photo_url: photo_url || null,
      created_at: new Date().toISOString(),
    };

    mockStore.actions.unshift(newAction);

    // If it's an injection action and an alert exists, mark alert in_progress
    if (alert_id) {
      const alert = mockStore.alerts.find((a) => a.id === alert_id);
      if (alert && alert.status === "open") {
        alert.status = "in_progress";
      }
    }

    return NextResponse.json({ data: newAction }, { status: 201 });
  } catch (error) {
    console.error("POST /api/actions error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mencatat tindakan lapangan" } },
      { status: 500 }
    );
  }
}

