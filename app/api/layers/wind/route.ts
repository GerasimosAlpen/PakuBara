import { NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/integrations/openmeteo";

export async function GET() {
  try {
    const weather = await fetchWeatherData(-1.2345, 102.6789);
    return NextResponse.json(weather);
  } catch (error) {
    console.error("GET /api/layers/wind error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil data angin" } },
      { status: 500 }
    );
  }
}

