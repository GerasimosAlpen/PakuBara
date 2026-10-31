import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bucket = req.nextUrl.searchParams.get("bucket") || "raw";

    const readings = mockStore.readings.filter(
      (r) => r.node_id.toLowerCase() === id.toLowerCase()
    );

    readings.sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    );

    return NextResponse.json({
      node_id: id,
      bucket,
      count: readings.length,
      data: readings,
    });
  } catch (error) {
    console.error("GET /api/nodes/[id]/readings error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil deret waktu sensor" } },
      { status: 500 }
    );
  }
}

