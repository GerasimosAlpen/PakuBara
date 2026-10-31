import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import { resolveAlertSchema } from "@/lib/validators/schemas";
import {
  formatResolvedMessage,
  sendWhatsAppMessage,
} from "@/lib/integrations/fonnte";

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

    const body = await req.json();
    const result = resolveAlertSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_payload",
            message: "Format data penutupan alert tidak valid",
            details: result.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { status, resolution_note } = result.data;
    alert.status = status;
    alert.resolved_at = new Date().toISOString();
    alert.resolution_note = resolution_note;

    // Reset node status to normal if resolved
    const node = mockStore.nodes.find((n) => n.id === alert.node_id);
    if (node) {
      node.status = "normal";
      if (node.last_reading.t50 && node.last_reading.t50 > 35) {
        node.last_reading.t50 = 31.5;
        node.last_reading.t20 = 29.8;
      }
    }

    // Log action
    mockStore.actions.unshift({
      id: `ac-${Date.now()}`,
      org_id: alert.org_id,
      alert_id: alert.id,
      node_id: alert.node_id,
      kind: status === "false_alarm" ? "other" : "injection",
      note: `Alert ditutup (${status}): ${resolution_note}`,
      created_at: new Date().toISOString(),
    });

    // Send WhatsApp notification
    if (status === "resolved") {
      const msg = formatResolvedMessage(alert.node_id, "Blok B Pulau Padang");
      sendWhatsAppMessage(process.env.FONNTE_DEFAULT_TARGET || "", msg);
    }

    return NextResponse.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    console.error("POST /api/alerts/[id]/resolve error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal menutup alert" } },
      { status: 500 }
    );
  }
}

