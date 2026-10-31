import { NextResponse } from "next/server";
import { fetchFirmsHotspots } from "@/lib/integrations/firms";

export async function GET() {
  try {
    const rawHotspots = await fetchFirmsHotspots();

    const geojson = {
      type: "FeatureCollection",
      features: rawHotspots.map((h) => ({
        type: "Feature",
        id: h.id,
        geometry: {
          type: "Point",
          coordinates: [h.longitude, h.latitude],
        },
        properties: {
          id: h.id,
          satellite: h.satellite,
          confidence: h.confidence,
          frp: h.frp,
          acq_date: h.acq_date,
          acq_time: h.acq_time,
          daynight: h.daynight,
        },
      })),
    };

    return NextResponse.json({
      success: true,
      data: rawHotspots,
      geojson,
    });
  } catch (error) {
    console.error("GET /api/layers/hotspots error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil data titik api FIRMS" } },
      { status: 500 }
    );
  }
}

