import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const nodeId = body.node_id || "PK-04";
    const targetTemp = body.target_temp !== undefined ? Number(body.target_temp) : 95.0;
    const coPpm = body.co_ppm !== undefined ? Number(body.co_ppm) : 210.0;

    const result = mockStore.heatNode(nodeId, targetTemp, coPpm);

    if (!result) {
      return NextResponse.json(
        { error: "Node tidak ditemukan", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Node ${nodeId} berhasil dipanaskan menjadi ${targetTemp}°C`,
      data: result,
    });
  } catch (error) {
    console.error("Gagal menjalankan demo heat:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

