import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const areaId = req.nextUrl.searchParams.get("area_id");

  try {
    let list = mockStore.alerts;

    if (status && status !== "all") {
      list = list.filter((a) => a.status === status);
    }

    if (areaId) {
      list = list.filter((a) => a.area_id === areaId);
    }

    return NextResponse.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (error) {
    if ((error as any)?.digest?.startsWith("NEXT_")) {
      throw error;
    }
    console.error("Gagal mengambil daftar alerts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
