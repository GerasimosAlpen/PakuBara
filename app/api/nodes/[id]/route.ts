import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import { updateNodeSchema } from "@/lib/validators/schemas";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const node = mockStore.nodes.find((n) => n.id.toLowerCase() === id.toLowerCase());

    if (!node) {
      return NextResponse.json(
        { error: { code: "not_found", message: `Node ${id} tidak ditemukan` } },
        { status: 404 }
      );
    }

    const openAlert = mockStore.alerts.find(
      (a) => a.node_id === node.id && ["open", "acknowledged", "in_progress"].includes(a.status)
    );

    const isPK04 = node.id === "PK-04";
    const prediction = isPK04
      ? {
          rate_c_per_h: { t20: 2.1, t50: 6.0, t100: 0.3 },
          ember_depth_cm: 50,
          direction_deg: 45,
          speed_cm_per_h: 4.2,
          eta_surface_h: 11.9,
          confidence: "high",
        }
      : null;

    return NextResponse.json({
      id: node.id,
      type: node.type,
      status: node.status,
      area: { id: node.area_id, name: "Blok B Pulau Padang (Sektor B-04)" },
      location: { lat: node.lat, lon: node.lon },
      last_seen: node.last_seen,
      last_reading: node.last_reading,
      battery: {
        mv: node.batt_mv,
        percent: Math.min(100, Math.max(0, Math.round(((node.batt_mv - 3000) / 1200) * 100))),
      },
      rssi: node.rssi,
      prediction,
      open_alert_id: openAlert?.id || null,
    });
  } catch (error) {
    console.error("GET /api/nodes/[id] error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil detail node" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const node = mockStore.nodes.find((n) => n.id.toLowerCase() === id.toLowerCase());

    if (!node) {
      return NextResponse.json(
        { error: { code: "not_found", message: `Node ${id} tidak ditemukan` } },
        { status: 404 }
      );
    }

    const body = await req.json();
    const result = updateNodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_payload",
            message: "Format data pembaruan node tidak valid",
            details: result.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { area_id, lat, lon } = result.data;
    if (area_id) node.area_id = area_id;
    if (lat !== undefined) node.lat = lat;
    if (lon !== undefined) node.lon = lon;

    return NextResponse.json({ data: node });
  } catch (error) {
    console.error("PATCH /api/nodes/[id] error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal memperbarui node" } },
      { status: 500 }
    );
  }
}

