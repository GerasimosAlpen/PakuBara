import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Generate grid around Pulau Padang (approx 102.65 to 102.72 lon, -1.21 to -1.26 lat)
    const minLon = 102.66;
    const maxLon = 102.71;
    const minLat = -1.25;
    const maxLat = -1.22;
    const step = 0.009; // approx 1 km

    const features = [];
    let cellIdx = 1;

    for (let lat = maxLat; lat > minLat; lat -= step) {
      for (let lon = minLon; lon < maxLon; lon += step) {
        // Compute realistic score
        const distFromFireCenter = Math.hypot(lon - 102.6789, lat - (-1.2345));
        const baseScore = Math.max(25, 95 - distFromFireCenter * 1500);
        const score = parseFloat(Math.min(98.5, Math.max(20.0, baseScore + (cellIdx % 5) * 2)).toFixed(1));

        let level = "RENDAH";
        if (score >= 80) level = "KRITIS";
        else if (score >= 60) level = "TINGGI";
        else if (score >= 35) level = "SEDANG";

        const reasons = [
          { factor: "Kepadatan kanal gambut terbuka", share: 0.38 },
          { factor: "Riwayat titik api 5 tahun (VIIRS)", share: 0.27 },
          { factor: "Akses jalan dan kanal terdekat", share: 0.18 },
        ];

        features.push({
          type: "Feature",
          id: `PADANG-CELL-${cellIdx}`,
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [lon, lat],
                [lon + step, lat],
                [lon + step, lat - step],
                [lon, lat - step],
                [lon, lat],
              ],
            ],
          },
          properties: {
            cell_id: `PADANG-CELL-${cellIdx}`,
            kabupaten: "Kepulauan Meranti (KHG Pulau Padang)",
            score,
            level,
            reasons,
          },
        });
        cellIdx++;
      }
    }

    return NextResponse.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("GET /api/layers/risk error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal memuat layer Peta Prioritas Siaga" } },
      { status: 500 }
    );
  }
}

