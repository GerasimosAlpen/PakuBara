export interface DataPoint {
  time: Date;
  temp: number;
}

export interface RegressionResult {
  slopePerHour: number;
  rSquared: number;
  count: number;
}

/**
 * Calculates Ordinary Least Squares (OLS) linear regression of temperature over time in hours.
 * Returns rate of change in °C/hour and R^2 coefficient of determination.
 */
export function calculateRateOfChange(points: DataPoint[]): RegressionResult {
  if (!points || points.length < 2) {
    return { slopePerHour: 0, rSquared: 0, count: points?.length || 0 };
  }

  // Filter out invalid/null values
  const validPoints = points
    .filter((p) => typeof p.temp === "number" && !isNaN(p.temp))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  const n = validPoints.length;
  if (n < 2) {
    return { slopePerHour: 0, rSquared: 0, count: n };
  }

  const t0 = validPoints[0].time.getTime();
  // x values in hours relative to first point
  const x = validPoints.map((p) => (p.time.getTime() - t0) / (1000 * 3600));
  const y = validPoints.map((p) => p.temp);

  const sumX = x.reduce((acc, val) => acc + val, 0);
  const sumY = y.reduce((acc, val) => acc + val, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  if (denomX === 0) {
    return { slopePerHour: 0, rSquared: 0, count: n };
  }

  const slope = numerator / denomX;
  const rSquared =
    denomY === 0 ? 0 : Math.min(1, Math.max(0, Math.pow(numerator, 2) / (denomX * denomY)));

  return {
    slopePerHour: parseFloat(slope.toFixed(2)),
    rSquared: parseFloat(rSquared.toFixed(3)),
    count: n,
  };
}

