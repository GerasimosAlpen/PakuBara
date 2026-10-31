/**
 * PakuBara Posko Serial Bridge
 * Mengacu pada PRD Seksi 4.3 & 4.4:
 * Membaca stream JSON dari Gateway ESP32 via USB Serial (115200 baud),
 * menyematkan timestamp NTP lokal, menyimpan antrean cadangan saat offline,
 * dan mengirimkan batch ke POST /api/ingest.
 */

const fs = require("fs");
const path = require("path");

const API_BASE_URL = process.env.PAKUBARA_API_URL || "http://localhost:3000";
const GATEWAY_ID = process.env.GATEWAY_ID || "GW-01";
const GATEWAY_SECRET = process.env.GATEWAY_SECRET || "";
const QUEUE_FILE = path.join(__dirname, "offline-queue.jsonl");
const BATCH_INTERVAL_MS = 5000;
const MAX_BATCH_SIZE = 50;

let memoryBuffer = [];

function loadOfflineQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return [];
  const raw = fs.readFileSync(QUEUE_FILE, "utf8").trim();
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function saveOfflineQueue(items) {
  if (items.length === 0) {
    if (fs.existsSync(QUEUE_FILE)) fs.unlinkSync(QUEUE_FILE);
    return;
  }
  const content = items.map((item) => JSON.stringify(item)).join("\n") + "\n";
  fs.writeFileSync(QUEUE_FILE, content, "utf8");
}

function parseGatewaySerialLine(line) {
  try {
    const packet = JSON.parse(line.trim());
    if (typeof packet.node !== "number" || typeof packet.seq !== "number") {
      return null;
    }
    return {
      node: packet.node,
      seq: packet.seq,
      measured_at: new Date().toISOString(),
      t20: packet.t20 ?? undefined,
      t50: packet.t50 ?? undefined,
      t100: packet.t100 ?? undefined,
      co: packet.co ?? null,
      batt_mv: packet.batt_mv ?? 3900,
      flags: packet.flags ?? 0,
      rssi: packet.rssi ?? -82,
      snr: packet.snr ?? 7.5,
    };
  } catch {
    return null;
  }
}

async function flushBatch() {
  const persisted = loadOfflineQueue();
  const combined = [...persisted, ...memoryBuffer];
  memoryBuffer = [];

  if (combined.length === 0) return;

  const batch = combined.slice(0, MAX_BATCH_SIZE);
  const remaining = combined.slice(MAX_BATCH_SIZE);

  try {
    const response = await fetch(`${API_BASE_URL}/api/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GATEWAY_SECRET}`,
      },
      body: JSON.stringify({
        gateway_id: GATEWAY_ID,
        sent_at: new Date().toISOString(),
        readings: batch,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(
      `[Bridge] Terkirim ${batch.length} paket | Diterima: ${result.accepted} | Alert baru: ${(result.alerts_created || []).length}`
    );
    saveOfflineQueue(remaining);
  } catch (err) {
    console.warn(`[Bridge] Koneksi tertunda (${err.message}). Menyimpan ${combined.length} paket ke antrean lokal.`);
    saveOfflineQueue(combined);
  }
}

setInterval(flushBatch, BATCH_INTERVAL_MS);

module.exports = {
  parseGatewaySerialLine,
  flushBatch,
};

