import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET() {
  try {
    const points = mockStore.nodes
      .filter((n) => n.type === "probe" && n.status !== "offline")
      .map((n) => {
        const t = Math.max(
          n.last_reading.t20 || 0,
          n.last_reading.t50 || 0,
          n.last_reading.t100 || 0
        );
        return {
          id: n.id,
          coordinates: [n.lon, n.lat],
          temperature: t,
          // normalized weight for deck.gl HeatmapLayer
          weight: Math.max(0.1, (t - 25) / 60),
        };
      });

    return NextResponse.json({
      type: "FeatureCollection",
      features: points.map((p) => ({
        type: "Feature",
        id: p.id,
        geometry: {
          type: "Point",
          coordinates: p.coordinates,
        },
        properties: {
          temperature: p.temperature,
          weight: p.weight,
        },
      })),
    });
  } catch (error) {
    console.error("GET /api/layers/heat error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal memuat layer panas bawah tanah" } },
      { status: 500 }
    );
  }
}

