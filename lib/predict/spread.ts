export interface NeighborNode {
  id: string;
  lat: number;
  lon: number;
  rateOfChange: number; // °C/hour
  lastTemp: number;
}

export interface SpreadPredictionResult {
  directionDeg: number | null;
  directionText: string;
  speedCmPerHour: number;
  emberDepthCm: 20 | 50 | 100;
  etaSurfaceHours: number;
  confidence: "low" | "medium" | "high";
  targetNeighborId?: string;
  waterRecommendationLiters: number;
}

/**
 * Converts degree differences (lat, lon) to approximate local meters (dx, dy).
 * Earth radius ~6371000m.
 */
export function geoToLocalMeters(
  originLat: number,
  originLon: number,
  targetLat: number,
  targetLon: number
): { dx: number; dy: number; distanceMeters: number } {
  const latRad = (originLat * Math.PI) / 180;
  const dy = (targetLat - originLat) * 111320;
  const dx = (targetLon - originLon) * (111320 * Math.cos(latRad));
  const distanceMeters = Math.sqrt(dx * dx + dy * dy);
  return { dx, dy, distanceMeters };
}

/**
 * Converts azimuth angle (0 to 360 degrees, clockwise from North) to Indonesian compass direction.
 */
export function degreesToCompass(deg: number): string {
  const directions = [
    "Utara",
    "Timur Laut",
    "Timur",
    "Tenggara",
    "Selatan",
    "Barat Daya",
    "Barat",
    "Barat Laut",
  ];
  const index = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return directions[index];
}

/**
 * Computes spread direction, speed, active ember depth, and surface ETA.
 */
export function calculateSpreadPrediction(
  centerNode: { lat: number; lon: number; t20: number; t50: number; t100: number; r20: number; r50: number; r100: number },
  neighbors: NeighborNode[]
): SpreadPredictionResult {
  // 1. Determine active ember depth z* = argmax (T_z * r_z)
  const depths: (20 | 50 | 100)[] = [20, 50, 100];
  const scores = [
    { depth: 20 as const, score: Math.max(0, centerNode.t20) * Math.max(0.1, centerNode.r20) },
    { depth: 50 as const, score: Math.max(0, centerNode.t50) * Math.max(0.1, centerNode.r50) },
    { depth: 100 as const, score: Math.max(0, centerNode.t100) * Math.max(0.1, centerNode.r100) },
  ];
  scores.sort((a, b) => b.score - a.score);
  const emberDepthCm = scores[0].depth;

  // Recommended water injection volume based on depth & temperature
  let baseLiters = 80;
  if (emberDepthCm === 50) baseLiters = 120;
  if (emberDepthCm === 100) baseLiters = 180;
  const waterRecommendationLiters = baseLiters;

  // Filter neighbors with positive temperature rise within 100m
  const positiveNeighbors = neighbors
    .map((n) => {
      const geo = geoToLocalMeters(centerNode.lat, centerNode.lon, n.lat, n.lon);
      return { ...n, ...geo };
    })
    .filter((n) => n.distanceMeters <= 100 && n.rateOfChange > 0);

  if (positiveNeighbors.length === 0) {
    const defaultSpeed = 3.5; // cm/hour typical smouldering peat spread
    const eta = parseFloat((emberDepthCm / defaultSpeed).toFixed(1));
    return {
      directionDeg: null,
      directionText: "Bara Statis / Tanpa Tetangga",
      speedCmPerHour: defaultSpeed,
      emberDepthCm,
      etaSurfaceHours: eta,
      confidence: "low",
      waterRecommendationLiters,
    };
  }

  // Calculate weighted vector direction
  // dx is East(+)/West(-), dy is North(+)/South(-)
  let sumWeightDx = 0;
  let sumWeightDy = 0;
  let maxRateNeighbor: NeighborNode | undefined = undefined;
  let maxRate = -1;

  for (const n of positiveNeighbors) {
    const weight = Math.max(0.1, n.rateOfChange);
    sumWeightDx += n.dx * weight;
    sumWeightDy += n.dy * weight;

    if (n.rateOfChange > maxRate) {
      maxRate = n.rateOfChange;
      maxRateNeighbor = n;
    }
  }

  // Math.atan2(dx, dy) gives clockwise radians from North (y is North)
  let angleRad = Math.atan2(sumWeightDx, sumWeightDy);
  let directionDeg = (angleRad * 180) / Math.PI;
  if (directionDeg < 0) directionDeg += 360;
  directionDeg = parseFloat(directionDeg.toFixed(1));

  // Speed in peat is typically 1 - 10 cm/hour
  // Higher rate of change -> faster spread
  const avgNeighborRate =
    positiveNeighbors.reduce((acc, val) => acc + val.rateOfChange, 0) /
    positiveNeighbors.length;
  const rawSpeed = 2.0 + avgNeighborRate * 0.8;
  const speedCmPerHour = parseFloat(Math.min(10.0, Math.max(1.0, rawSpeed)).toFixed(1));

  // ETA to surface in hours
  const etaSurfaceHours = parseFloat((emberDepthCm / speedCmPerHour).toFixed(1));

  let confidence: "low" | "medium" | "high" = "medium";
  if (positiveNeighbors.length >= 3) confidence = "high";
  if (positiveNeighbors.length === 1) confidence = "medium";

  const directionText = `${degreesToCompass(directionDeg)} (${directionDeg}°)`;

  return {
    directionDeg,
    directionText,
    speedCmPerHour,
    emberDepthCm,
    etaSurfaceHours,
    confidence,
    targetNeighborId: maxRateNeighbor?.id,
    waterRecommendationLiters,
  };
}

