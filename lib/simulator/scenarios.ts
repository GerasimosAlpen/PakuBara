export interface SyntheticReading {
  nodeId: string;
  seq: number;
  measuredAt: string;
  t20?: number;
  t50?: number;
  t100?: number;
  coPpm?: number;
  battMv?: number;
  flags?: number;
  rssi?: number;
  snr?: number;
}

export interface ScenarioDefinition {
  name: string;
  description: string;
  targetNodeId: string;
  steps: {
    stepIndex: number;
    delayMs: number;
    description: string;
    readings: SyntheticReading[];
    expectedStatus: "normal" | "watch" | "warning" | "active" | "offline";
    shouldTriggerAlert: boolean;
  }[];
}

/**
 * Generates synthetic telemetry steps for 4 interactive judge demo scenarios.
 */
export function getScenario(scenarioType: string): ScenarioDefinition {
  const now = new Date();
  const time = (offsetMinutes: number) =>
    new Date(now.getTime() + offsetMinutes * 60000).toISOString();

  switch (scenarioType) {
    case "spread_northeast":
      return {
        name: "Perambatan Bara ke Timur Laut",
        description:
          "Bara aktif terdeteksi di PK-04 kedalaman 50 cm, merambat ke PK-05 dan dikonfirmasi oleh gas CO tiang GS-01.",
        targetNodeId: "PK-04",
        steps: [
          {
            stepIndex: 1,
            delayMs: 0,
            description: "Kondisi baseline normal pasca-pemadaman permukaan.",
            expectedStatus: "normal",
            shouldTriggerAlert: false,
            readings: [
              { nodeId: "PK-04", seq: 101, measuredAt: time(-15), t20: 31.2, t50: 34.0, t100: 32.5, battMv: 3880, rssi: -84 },
              { nodeId: "PK-05", seq: 101, measuredAt: time(-15), t20: 30.5, t50: 32.0, t100: 31.8, battMv: 3910, rssi: -82 },
              { nodeId: "GS-01", seq: 101, measuredAt: time(-15), coPpm: 18.0, battMv: 3850, rssi: -86 },
            ],
          },
          {
            stepIndex: 2,
            delayMs: 3000,
            description: "Pemanasan pirolisis terdeteksi di kedalaman 50 cm (S1 aktif).",
            expectedStatus: "watch",
            shouldTriggerAlert: false,
            readings: [
              { nodeId: "PK-04", seq: 102, measuredAt: time(-10), t20: 33.0, t50: 52.4, t100: 35.1, battMv: 3870, rssi: -84 },
              { nodeId: "PK-05", seq: 102, measuredAt: time(-10), t20: 30.8, t50: 33.2, t100: 32.0, battMv: 3910, rssi: -82 },
              { nodeId: "GS-01", seq: 102, measuredAt: time(-10), coPpm: 38.0, battMv: 3850, rssi: -86 },
            ],
          },
          {
            stepIndex: 3,
            delayMs: 6000,
            description:
              "Bara menembus 87°C di PK-04, PK-05 naik terarah, dan CO GS-01 tembus 185 ppm (2 dari 3 terpenuhi).",
            expectedStatus: "active",
            shouldTriggerAlert: true,
            readings: [
              { nodeId: "PK-04", seq: 103, measuredAt: time(-5), t20: 36.4, t50: 87.3, t100: 42.0, battMv: 3860, rssi: -84 },
              { nodeId: "PK-05", seq: 103, measuredAt: time(-5), t20: 32.1, t50: 48.6, t100: 34.0, battMv: 3900, rssi: -82 },
              { nodeId: "GS-01", seq: 103, measuredAt: time(-5), coPpm: 185.0, battMv: 3840, rssi: -85 },
            ],
          },
        ],
      };

    case "false_alarm_co_only":
      return {
        name: "Alarm Palsu: Hanya Gas CO Meningkat",
        description:
          "Asap luar terbawa angin menaikkan sensor CO GS-01, namun paku suhu tanah tetap dingin. Sistem tidak mengirim WA darurat.",
        targetNodeId: "PK-04",
        steps: [
          {
            stepIndex: 1,
            delayMs: 0,
            description: "Kondisi normal awal pada seluruh paku dan tiang gas.",
            expectedStatus: "normal",
            shouldTriggerAlert: false,
            readings: [
              { nodeId: "PK-04", seq: 201, measuredAt: time(-10), t20: 29.8, t50: 31.0, t100: 30.2, battMv: 3880, rssi: -84 },
              { nodeId: "PK-05", seq: 201, measuredAt: time(-10), t20: 29.5, t50: 30.5, t100: 30.0, battMv: 3900, rssi: -82 },
              { nodeId: "GS-01", seq: 201, measuredAt: time(-10), coPpm: 22.0, battMv: 3850, rssi: -86 },
            ],
          },
          {
            stepIndex: 2,
            delayMs: 4000,
            description: "CO melonjak ke 125 ppm, namun suhu paku tetap stabil 30°C (Hanya 1 dari 3 sinyal).",
            expectedStatus: "watch",
            shouldTriggerAlert: false, // Verified: No WhatsApp alert dispatched
            readings: [
              { nodeId: "PK-04", seq: 202, measuredAt: time(-5), t20: 30.0, t50: 31.2, t100: 30.1, battMv: 3870, rssi: -84 },
              { nodeId: "PK-05", seq: 202, measuredAt: time(-5), t20: 29.6, t50: 30.8, t100: 30.0, battMv: 3900, rssi: -82 },
              { nodeId: "GS-01", seq: 202, measuredAt: time(-5), coPpm: 125.0, battMv: 3850, rssi: -85 },
            ],
          },
        ],
      };

    case "battery_dead":
      return {
        name: "Paku Kehabisan Baterai & Terputus",
        description: "Baterai PK-07 turun di bawah ambang batas dan status berubah menjadi offline.",
        targetNodeId: "PK-07",
        steps: [
          {
            stepIndex: 1,
            delayMs: 0,
            description: "Baterai PK-07 melemah ke 3100 mV (indikator waspada).",
            expectedStatus: "normal",
            shouldTriggerAlert: false,
            readings: [
              { nodeId: "PK-07", seq: 301, measuredAt: time(-20), t20: 28.5, t50: 29.0, t100: 28.9, battMv: 3100, flags: 4, rssi: -98 },
            ],
          },
          {
            stepIndex: 2,
            delayMs: 4000,
            description: "Node tidak mengirimkan paket lebih dari 3x interval pengiriman.",
            expectedStatus: "offline",
            shouldTriggerAlert: false,
            readings: [],
          },
        ],
      };

    case "area_recovery":
    default:
      return {
        name: "Pemulihan Area Pasca-Suntik Air",
        description:
          "Injeksi peat nozzle dilakukan, suhu turun kembali di bawah 35°C, dan masa verifikasi stabil 72 jam dimulai.",
        targetNodeId: "PK-04",
        steps: [
          {
            stepIndex: 1,
            delayMs: 0,
            description: "Suhu tanah mulai turun drastis setelah injeksi air bertekanan.",
            expectedStatus: "watch",
            shouldTriggerAlert: false,
            readings: [
              { nodeId: "PK-04", seq: 401, measuredAt: time(-10), t20: 32.0, t50: 42.0, t100: 35.0, battMv: 3850, rssi: -84 },
              { nodeId: "GS-01", seq: 401, measuredAt: time(-10), coPpm: 45.0, battMv: 3840, rssi: -85 },
            ],
          },
          {
            stepIndex: 2,
            delayMs: 4000,
            description: "Seluruh kedalaman di bawah 35°C, alert ditutup, dan status kembali normal.",
            expectedStatus: "normal",
            shouldTriggerAlert: false,
            readings: [
              { nodeId: "PK-04", seq: 402, measuredAt: time(-2), t20: 28.4, t50: 29.8, t100: 29.2, battMv: 3850, rssi: -84 },
              { nodeId: "GS-01", seq: 402, measuredAt: time(-2), coPpm: 12.0, battMv: 3840, rssi: -85 },
            ],
          },
        ],
      };
  }
}

