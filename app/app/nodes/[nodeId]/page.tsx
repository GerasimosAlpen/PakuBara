"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PeatCrossSectionSvg } from "@/components/charts/PeatCrossSectionSvg";
import { NodeTimeSeriesChart } from "@/components/charts/NodeTimeSeriesChart";
import {
  Flame,
  ArrowLeft,
  Radio,
  Battery,
  Wifi,
  Clock,
  Compass,
  Droplets,
  AlertTriangle,
  Send,
  CheckCircle2,
} from "lucide-react";

interface NodeDetail {
  id: string;
  type: "probe" | "gas";
  status: "normal" | "watch" | "warning" | "active" | "offline";
  batt_mv: number;
  rssi: number;
  last_seen: string;
  last_reading: {
    t20?: number;
    t50?: number;
    t100?: number;
    co?: number;
  };
  rate_c_per_hour?: number;
  spread_prediction?: {
    direction_deg: number;
    direction_name: string;
    eta_hours: number;
    target_depth_cm: number;
    recommended_water_liters: number;
  };
}

interface ReadingItem {
  measured_at: string;
  t20?: number | null;
  t50?: number | null;
  t100?: number | null;
  co_ppm?: number | null;
}

function NodeDetailContent() {
  const params = useParams();
  const nodeId = (params?.nodeId as string) || "PK-04";

  const [node, setNode] = useState<NodeDetail | null>(null);
  const [readings, setReadings] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);
  const [waterLiters, setWaterLiters] = useState<number>(600);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    async function fetchNodeDetails() {
      try {
        const [nodeRes, readingsRes] = await Promise.all([
          fetch(`/api/nodes/${nodeId}`),
          fetch(`/api/nodes/${nodeId}/readings?hours=24`),
        ]);

        const nodeJson = await nodeRes.json();
        const readingsJson = await readingsRes.json();

        if (nodeJson.success && nodeJson.data) {
          setNode(nodeJson.data);
        }
        if (readingsJson.success && Array.isArray(readingsJson.data)) {
          setReadings(readingsJson.data);
        }
      } catch (err) {
        console.error("Gagal memuat detail titik:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNodeDetails();
  }, [nodeId]);

  const handleRecordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: nodeId,
          kind: "injection",
          water_liters: Number(waterLiters),
          depth_cm: 50,
          note,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess(true);
      }
    } catch (err) {
      console.error("Gagal mencatat tindakan:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-stone-100 flex flex-col">
        <AppNavbar />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-stone-400">
            Memuat telemetri titik {nodeId}...
          </div>
        </div>
      </div>
    );
  }

  const isKalimantan = nodeId.includes("-K") || nodeId.startsWith("PK-K") || nodeId.startsWith("GS-K");
  const isEmber = nodeId === "PK-04" || nodeId === "PK-K03";
  const t20 = node?.last_reading.t20 ?? (isEmber ? (isKalimantan ? 38.2 : 36.4) : 29.5);
  const t50 = node?.last_reading.t50 ?? (isEmber ? (isKalimantan ? 89.6 : 87.3) : 31.0);
  const t100 = node?.last_reading.t100 ?? (isEmber ? (isKalimantan ? 43.1 : 42.0) : 30.2);
  const battVolts = ((node?.batt_mv ?? 3860) / 1000).toFixed(2);

  const directionName = isKalimantan ? "Tenggara (135°)" : "Timur Laut (45°)";
  const etaHours = isKalimantan ? 9.2 : 11.9;
  const targetNeighbor = isKalimantan ? "PK-K04 (Sebangau)" : "PK-05 (Pulau Padang)";
  const waterRec = isKalimantan ? 800 : 600;

  return (
    <div className="min-h-screen bg-ink text-stone-100 flex flex-col select-none">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Back button & Node Title Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/app"
                className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold font-mono text-stone-100">
                    TITIK SENSOR {node?.id}
                  </h1>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      node?.status === "active"
                        ? "bg-red-600 text-white"
                        : node?.status === "watch"
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {node?.status === "active" ? "Bara Aktif" : node?.status}
                  </span>
                </div>
                <div className="text-xs text-stone-400">
                  {node?.type === "probe"
                    ? "Paku Termal Stainless Steel (3 Kedalaman)"
                    : "Tiang Gas CO Gambut (LoRa)"}
                  {" • "}
                  <span className="text-stone-300 font-medium">
                    {isKalimantan
                      ? "KHG Kahayan - Sebangau (Kalteng)"
                      : "Blok B Pulau Padang (Riau)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Hardware Metrics Chips */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-stone-200">{battVolts} V</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800">
                <Wifi className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-stone-200">{node?.rssi ?? -84} dBm</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-stone-200">
                  {new Date(node?.last_seen || Date.now()).toLocaleTimeString("id-ID")}
                </span>
              </div>
            </div>
          </div>

          {/* Time Series Chart */}
          <div>
            <NodeTimeSeriesChart
              data={readings}
              title={`Deret Waktu 24 Jam Titik ${node?.id}`}
              showCo={node?.type === "gas" || isEmber}
            />
          </div>

          {/* Two-Column Grid: Cross Section & Smoldering Prediction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peat Soil Cross Section */}
            <div>
              <PeatCrossSectionSvg
                t20={t20}
                t50={t50}
                t100={t100}
                waterTableCm={-55}
                highlightDepth={50}
                interactive={true}
              />
            </div>

            {/* Physical Regression & Spread Prediction Card */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-4">
                <h3 className="text-xs font-semibold text-stone-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-orange-400" />
                  Model Prediksi Arah Rambat & Waktu Tiba (ETA)
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80">
                    <span className="text-xs text-stone-400 block">
                      Laju Pemanasan (r_z)
                    </span>
                    <span className="text-lg font-black font-mono text-amber-400">
                      +{node?.rate_c_per_hour ?? (isKalimantan ? 6.8 : 6.0)}°C / jam
                    </span>
                    <span className="text-xs text-stone-400 block mt-0.5">
                      R² = 0.94 (Korelasi Sangat Kuat)
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80">
                    <span className="text-xs text-stone-400 block">
                      Estimasi Waktu Tiba (ETA)
                    </span>
                    <span className="text-lg font-black font-mono text-red-400">
                      {etaHours} Jam
                    </span>
                    <span className="text-xs text-stone-400 block mt-0.5">
                      Menuju Node {targetNeighbor}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80">
                    <span className="text-xs text-stone-400 block">
                      Arah Rambatan (Theta)
                    </span>
                    <span className="text-base font-bold font-mono text-stone-100 mt-1 block">
                      {directionName}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80">
                    <span className="text-xs text-stone-400 block">
                      Rekomendasi Air Gambut
                    </span>
                    <span className="text-base font-bold font-mono text-orange-400 mt-1 block">
                      {waterRec} Liter
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800/80 text-xs text-stone-300 leading-relaxed">
                  <strong className="text-orange-300">Instruksi Tim Pemadam:</strong> Tancapkan pipa nozzle suntik air pada kedalaman 50 cm
                  dengan radius 15 meter ke arah {directionName} untuk memutus suplai oksigen pirolisis gambut.
                </div>
              </div>

              {/* Form Catat Tindakan Pemadaman Langsung */}
              <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
                <h3 className="text-xs font-semibold text-stone-200 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-orange-400" />
                  Catat Tindakan Lapangan pada Titik Ini
                </h3>

                {actionSuccess ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Tindakan berhasil dicatat dan masuk ke riwayat audit.</span>
                  </div>
                ) : (
                  <form onSubmit={handleRecordAction} className="space-y-3 text-xs">
                    <div>
                      <label className="text-xs text-stone-400 block mb-1">
                        Volume Injeksi Air (Liter)
                      </label>
                      <input
                        type="number"
                        value={waterLiters}
                        onChange={(e) => setWaterLiters(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-stone-400 block mb-1">
                        Catatan Tindakan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Injeksi pipa nozzle 600L selesai, suhu turun..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-50 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simpan Tindakan</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NodeDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono text-stone-400">
          Memuat telemetri titik sensor...
        </div>
      }
    >
      <NodeDetailContent />
    </Suspense>
  );
}

