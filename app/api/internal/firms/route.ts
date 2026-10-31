import { NextRequest, NextResponse } from "next/server";
import { fetchFirmsHotspots } from "@/lib/integrations/firms";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hotspots = await fetchFirmsHotspots();
    return NextResponse.json({
      success: true,
      message: `Sinkronisasi data NASA FIRMS berhasil (${hotspots.length} titik hotspot ditemukan)`,
      data_count: hotspots.length,
      synced_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
