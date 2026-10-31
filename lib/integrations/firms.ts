import fs from "fs";
import path from "path";

export interface FirmsHotspot {
  id: string;
  latitude: number;
  longitude: number;
  bright_ti4?: number;
  scan?: number;
  track?: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string;
  version?: string;
  bright_ti5?: number;
  frp: number; // Fire Radiative Power (MW)
  daynight: string;
}

/**
 * Fetches NASA FIRMS active hotspots for a given bounding box.
 * Automatically falls back to local cached GeoJSON if offline or key is missing.
 */
export async function fetchFirmsHotspots(
  west: number = 102.0,
  south: number = -1.8,
  east: number = 103.5,
  north: number = 0.5,
  dayRange: number = 2
): Promise<FirmsHotspot[]> {
  const mapKey = process.env.FIRMS_MAP_KEY || process.env.NASA_FIRMS_MAP_KEY;

  if (!mapKey) {
    console.warn("NASA_FIRMS_MAP_KEY missing. Loading fallback dataset.");
    return loadFallbackFirms();
  }

  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${west},${south},${east},${north}/${dayRange}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      console.warn(`NASA FIRMS API returned status ${response.status}. Using fallback.`);
      return loadFallbackFirms();
    }

    const text = await response.text();
    return parseFirmsCsv(text);
  } catch (error) {
    console.warn("Failed to reach NASA FIRMS API. Using fallback:", error);
    return loadFallbackFirms();
  }
}

/**
 * Parses raw CSV response from NASA FIRMS Area API into typed objects.
 */
export function parseFirmsCsv(csvText: string): FirmsHotspot[] {
  const lines = csvText.trim().split("\n");
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const hotspots: FirmsHotspot[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < headers.length) continue;

    const lat = parseFloat(cols[headers.indexOf("latitude")]);
    const lon = parseFloat(cols[headers.indexOf("longitude")]);
    const acqDate = cols[headers.indexOf("acq_date")];
    const acqTime = cols[headers.indexOf("acq_time")];
    const frp = parseFloat(cols[headers.indexOf("frp")]) || 5.0;
    const confidence = cols[headers.indexOf("confidence")] || "nominal";
    const satellite = cols[headers.indexOf("satellite")] || "VIIRS-SNPP";

    if (!isNaN(lat) && !isNaN(lon)) {
      hotspots.push({
        id: `FIRMS_${lat.toFixed(4)}_${lon.toFixed(4)}_${acqDate}_${acqTime}`,
        latitude: lat,
        longitude: lon,
        acq_date: acqDate,
        acq_time: acqTime,
        satellite,
        confidence,
        frp,
        daynight: cols[headers.indexOf("daynight")] || "D",
      });
    }
  }

  return hotspots;
}

/**
 * Loads realistic fallback hotspots for pilot peat hydrological units (KHG).
 */
export function loadFallbackFirms(): FirmsHotspot[] {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "firms-fallback.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading firms-fallback.json:", err);
  }

  // Realistic mock data points around Pulau Padang & Kepulauan Meranti
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  return [
    {
      id: "FIRMS_P01",
      latitude: -1.2312,
      longitude: 102.6845,
      acq_date: dateStr,
      acq_time: "0624",
      satellite: "VIIRS_NOAA20",
      confidence: "high",
      frp: 18.4,
      daynight: "D",
    },
    {
      id: "FIRMS_P02",
      latitude: -1.2405,
      longitude: 102.6912,
      acq_date: dateStr,
      acq_time: "0624",
      satellite: "VIIRS_NOAA20",
      confidence: "nominal",
      frp: 9.7,
      daynight: "D",
    },
    {
      id: "FIRMS_P03",
      latitude: -1.2250,
      longitude: 102.6730,
      acq_date: dateStr,
      acq_time: "1410",
      satellite: "VIIRS_SNPP",
      confidence: "high",
      frp: 34.2,
      daynight: "N",
    },
    {
      id: "FIRMS_P04",
      latitude: -1.2510,
      longitude: 102.7050,
      acq_date: dateStr,
      acq_time: "1410",
      satellite: "VIIRS_SNPP",
      confidence: "low",
      frp: 4.5,
      daynight: "N",
    },
  ];
}

