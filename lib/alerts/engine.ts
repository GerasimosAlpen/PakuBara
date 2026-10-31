export interface ThresholdConfig {
  tempAbsC: number; // default 60°C
  tempRateCPerH: number; // default 3°C/h
  coPpm: number; // default 50 ppm
  neighborRadiusM: number; // default 50 m
}

export interface NodeReadingState {
  nodeId: string;
  type: "probe" | "gas";
  currentTemp: number; // Max of t20, t50, t100
  tempRatePerHour: number;
  rSquared: number;
  dataPointCount: number;
  lastSeen: Date;
  installedAt: Date;
  status: "normal" | "watch" | "warning" | "active" | "offline";
}

export interface NeighborReadingState {
  nodeId: string;
  distanceMeters: number;
  tempRatePerHour: number;
}

export interface GasReadingState {
  nodeId: string;
  distanceMeters: number;
  currentCoPpm: number;
  coMedian24h: number;
  coStdDev24h: number;
  installedAt: Date;
}

export interface AlertEvaluationResult {
  s1TempTrend: boolean;
  s2Neighbor: boolean;
  s3GasCo: boolean;
  signalsCount: number;
  s2Assessable: boolean;
  s3Assessable: boolean;
  newStatus: "normal" | "watch" | "warning" | "active" | "offline";
  isEmberActive: boolean;
  reason: string;
  isSaturated: boolean; // >= 124°C on DS18B20
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  tempAbsC: 60,
  tempRateCPerH: 3.0,
  coPpm: 50.0,
  neighborRadiusM: 50,
};

/**
 * Evaluates the 2-of-3 signal fusion rule:
 * S1: Temperature trend or absolute threshold
 * S2: Neighbor probe rising >= 1.5°C/h within radius
 * S3: Nearby CO gas sensor >= threshold or > median + 3*std
 */
export function evaluateSignals(
  node: NodeReadingState,
  neighbors: NeighborReadingState[],
  gasSensors: GasReadingState[],
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): AlertEvaluationResult {
  // Check sensor saturation (DS18B20 upper limit 125°C)
  const isSaturated = node.currentTemp >= 124.0;

  // 1. S1: Temperature Trend
  // S1 is met if temperature >= tempAbsC OR (rate >= tempRateCPerH with >= 6 points and R² >= 0.6)
  const isAbsCritical = node.currentTemp >= thresholds.tempAbsC || isSaturated;
  const isRateCritical =
    node.tempRatePerHour >= thresholds.tempRateCPerH &&
    node.dataPointCount >= 6 &&
    node.rSquared >= 0.6;
  const s1TempTrend = isAbsCritical || isRateCritical;

  // 2. S2: Neighbor Probes
  // Assessable if at least one probe exists within neighborRadiusM
  const nearbyNeighbors = neighbors.filter(
    (n) => n.distanceMeters <= thresholds.neighborRadiusM
  );
  const s2Assessable = nearbyNeighbors.length > 0;
  const s2Neighbor = s2Assessable
    ? nearbyNeighbors.some((n) => n.tempRatePerHour >= 1.5)
    : false;

  // 3. S3: Gas CO Sensor
  // Assessable if a gas sensor exists within 100 meters
  const nearbyGas = gasSensors.filter((g) => g.distanceMeters <= 100);
  const s3Assessable = nearbyGas.length > 0;
  let s3GasCo = false;

  if (s3Assessable) {
    const closestGas = nearbyGas.sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
    const hoursSinceInstalled =
      (Date.now() - closestGas.installedAt.getTime()) / (1000 * 3600);

    if (hoursSinceInstalled < 48) {
      // During initial 48h stabilization, use relative threshold only
      const relativeLimit =
        closestGas.coMedian24h + 3 * (closestGas.coStdDev24h || 5);
      s3GasCo = closestGas.currentCoPpm >= relativeLimit;
    } else {
      // Normal threshold: absolute OR relative
      const relativeLimit =
        closestGas.coMedian24h + 3 * (closestGas.coStdDev24h || 5);
      s3GasCo =
        closestGas.currentCoPpm >= thresholds.coPpm ||
        closestGas.currentCoPpm >= relativeLimit;
    }
  }

  // Count active signals
  let signalsCount = 0;
  if (s1TempTrend) signalsCount++;
  if (s2Neighbor) signalsCount++;
  if (s3GasCo) signalsCount++;

  // Determine Node Status
  let newStatus: "normal" | "watch" | "warning" | "active" | "offline" = "normal";
  let isEmberActive = false;

  // Isolated node rule: if neighbor or gas cannot be assessed, cannot reach "active", max "warning"
  const isIsolated = !s2Assessable && !s3Assessable;

  if (signalsCount >= 2 && !isIsolated) {
    newStatus = "active";
    isEmberActive = true;
  } else if (isAbsCritical || (signalsCount >= 2 && isIsolated)) {
    newStatus = "warning";
  } else if (signalsCount === 1) {
    newStatus = "watch";
  } else {
    newStatus = "normal";
  }

  // Build transparent explanation string
  const reasons: string[] = [];
  if (s1TempTrend) {
    if (isSaturated) reasons.push("Sensor jenuh (>= 124°C), bara sangat dekat");
    else if (isAbsCritical) reasons.push(`Suhu kritis (${node.currentTemp.toFixed(1)}°C >= ${thresholds.tempAbsC}°C)`);
    else reasons.push(`Laju pemanasan cepat (+${node.tempRatePerHour.toFixed(1)}°C/jam, R²=${node.rSquared})`);
  }
  if (s2Neighbor) {
    reasons.push("Paku tetangga mengonfirmasi kenaikan suhu terarah");
  } else if (!s2Assessable) {
    reasons.push("Tidak ada paku tetangga dalam radius (S2 tidak dapat dinilai)");
  }
  if (s3GasCo) {
    reasons.push("Sensor tiang gas mengonfirmasi lonjakan gas CO");
  } else if (!s3Assessable) {
    reasons.push("Tidak ada sensor gas dalam radius (S3 tidak dapat dinilai)");
  }

  const reason = reasons.length > 0 ? reasons.join("; ") : "Kondisi stabil di bawah ambang waspada";

  return {
    s1TempTrend,
    s2Neighbor,
    s3GasCo,
    signalsCount,
    s2Assessable,
    s3Assessable,
    newStatus,
    isEmberActive,
    reason,
    isSaturated,
  };
}

