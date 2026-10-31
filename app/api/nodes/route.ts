import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";
import { createNodeSchema } from "@/lib/validators/schemas";

export async function GET(req: NextRequest) {
  try {
    const areaId = req.nextUrl.searchParams.get("area_id");
    const status = req.nextUrl.searchParams.get("status");
    const type = req.nextUrl.searchParams.get("type");

    let nodes = [...mockStore.nodes];

    if (areaId) {
      nodes = nodes.filter((n) => n.area_id === areaId);
    }
    if (status) {
      nodes = nodes.filter((n) => n.status === status);
    }
    if (type) {
      nodes = nodes.filter((n) => n.type === type);
    }

    return NextResponse.json({
      success: true,
      data: nodes,
      total: nodes.length,
    });
  } catch (error) {
    console.error("GET /api/nodes error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil daftar node" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = createNodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "invalid_payload",
            message: "Format data pendaftaran node tidak valid",
            details: result.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { id, short_id, org_id, area_id, type, lat, lon } = result.data;

    // Check if duplicate ID
    if (mockStore.nodes.some((n) => n.id === id || n.short_id === short_id)) {
      return NextResponse.json(
        { error: { code: "conflict", message: "ID atau Short ID perangkat sudah terdaftar" } },
        { status: 409 }
      );
    }

    const newNode = {
      id,
      short_id,
      org_id,
      area_id: area_id || "a0000000-0000-0000-0000-000000000001",
      type,
      lat,
      lon,
      status: "normal" as const,
      batt_mv: 4000,
      rssi: -75,
      last_seen: new Date().toISOString(),
      last_reading: type === "probe" ? { t20: 28.5, t50: 29.0, t100: 28.8 } : { co: 12.0 },
    };

    mockStore.nodes.push(newNode);

    return NextResponse.json({ data: newNode }, { status: 201 });
  } catch (error) {
    console.error("POST /api/nodes error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mendaftarkan node baru" } },
      { status: 500 }
    );
  }
}

