import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/integrations/openmeteo";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weather = await fetchWeatherData(-1.23, 102.68);
    return NextResponse.json({
      success: true,
      message: "Data cuaca & angin Open-Meteo berhasil diperbarui",
      data: weather,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
