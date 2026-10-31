import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const areaId = req.nextUrl.searchParams.get("area_id");

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
    console.error("Gagal mengambil daftar alerts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
