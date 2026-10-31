/**
 * PakuBara - Posko Serial LoRa to Cloud HTTP Ingestion Bridge
 * Berjalan di Raspberry Pi atau PC Posko Lapangan.
 * Menerima baris JSON dari port Serial Gateway LoRa ESP32,
 * menyimpan ke antrean offline jika koneksi internet seluler terputus,
 * dan mem-flush batch ke endpoint /api/ingest secara berkala.
 */

import fs from "fs";
import readline from "readline";

const INGEST_URL = process.env.PAKUBARA_INGEST_URL || "http://localhost:3000/api/ingest";
const GATEWAY_API_KEY = process.env.PAKUBARA_GATEWAY_KEY || "pkb_gw_demo_token";
const BUFFER_FILE = "./bridge_offline_queue.json";

// In-memory queue
let packetBuffer = [];

// Load existing queue if any
if (fs.existsSync(BUFFER_FILE)) {
  try {
    const raw = fs.readFileSync(BUFFER_FILE, "utf-8");
    packetBuffer = JSON.parse(raw);
    console.log(`[Bridge] Memulihkan ${packetBuffer.length} paket tertunda dari disk.`);
  } catch (err) {
    packetBuffer = [];
  }
}

// Function to flush buffer to Cloud
async function flushBuffer() {
  if (packetBuffer.length === 0) return;

  const batch = packetBuffer.slice(0, 20); // Flush max 20 per call
  console.log(`[Bridge] Mencoba mengirim batch ${batch.length} paket ke ${INGEST_URL}...`);

  try {
    const response = await fetch(INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Gateway-Key": GATEWAY_API_KEY,
      },
      body: JSON.stringify({
        readings: batch.map((item) => ({
          node_id: item.node_id,
          seq: item.seq,
          measured_at: item.measured_at || new Date().toISOString(),
          t20: item.t20,
          t50: item.t50,
          t100: item.t100,
          co_ppm: item.co_ppm,
          batt_mv: item.batt_mv,
          rssi: item.rssi,
          snr: item.snr,
        })),
      }),
    });

    if (response.ok) {
      console.log(`[Bridge] Sukses flush ${batch.length} paket.`);
      packetBuffer = packetBuffer.slice(batch.length);
      saveQueueToDisk();
    } else {
      console.warn(`[Bridge] Cloud mengembalikan status ${response.status}. Antrean tetap disimpan.`);
    }
  } catch (error) {
    console.warn(`[Bridge] Gagal terhubung ke Cloud (offline backhaul). Paket disimpan di antrean.`);
  }
}

function saveQueueToDisk() {
  try {
    fs.writeFileSync(BUFFER_FILE, JSON.stringify(packetBuffer, null, 2));
  } catch (err) {
    console.error("[Bridge] Gagal menyimpan antrean ke disk:", err);
  }
}

// Flush scheduler every 5 seconds
setInterval(flushBuffer, 5000);

// CLI Standard Input Simulation for Gateway Serial
console.log("[Bridge] Siap menerima input Serial Gateway LoRa (JSON line).");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed || !trimmed.startsWith("{")) return;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.node_id) {
      parsed.measured_at = new Date().toISOString();
      packetBuffer.push(parsed);
      saveQueueToDisk();
      console.log(`[Bridge] Diterima paket dari ${parsed.node_id}. Buffer total: ${packetBuffer.length}`);
    }
  } catch (err) {
    // Abaikan baris debug serial non-json
  }
});

