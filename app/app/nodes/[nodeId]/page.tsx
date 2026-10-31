"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { PeatCrossSectionSvg } from "@/components/charts/PeatCrossSectionSvg";
import {
  ArrowLeft,
  Droplets,
  Send,
  CheckCircle2,
  AlertTriangle,
  Sliders,
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
}

function NodeDetailContent() {
  const params = useParams();
  const nodeId = (params?.nodeId as string) || "PK-04";

  const [node, setNode] = useState<NodeDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);
  const [waterLiters, setWaterLiters] = useState<number>(120);
  const [note, setNote] = useState<string>("");
  const [showLogForm, setShowLogForm] = useState<boolean>(false);

  useEffect(() => {
    async function fetchNodeDetails() {
      try {
        const nodeRes = await fetch(`/api/nodes/${nodeId}`);
        const nodeJson = await nodeRes.json();
        if (nodeJson.success && nodeJson.data) {
          setNode(nodeJson.data);
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
          note: note || `Injeksi Peat Nozzle ${waterLiters}L pada kedalaman 50 cm selesai.`,
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

  const isKalimantan =
    nodeId.includes("-K") || nodeId.startsWith("PK-K") || nodeId.startsWith("GS-K");
  const isNormalNode =
    nodeId === "PK-01" ||
    nodeId === "PK-02" ||
    nodeId === "PK-06" ||
    nodeId === "PK-10" ||
    nodeId === "PK-11" ||
    nodeId === "PK-12";

  const t20 = isNormalNode ? 29 : 34;
  const t50 = isNormalNode
    ? 31
    : node?.last_reading?.t50 && node.last_reading.t50 > 200
    ? node.last_reading.t50
    : 542;
  const t100 = isNormalNode ? 30 : 68;
  const coPeak = isNormalNode ? 18 : 185;
  const battVolts = ((node?.batt_mv ?? 3900) / 1000).toFixed(1);
  const sectorLabel = isKalimantan ? "Sektor Sebangau-03" : "Sektor B-04";

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          breadcrumb={`${sectorLabel} > Kluster Tiang CO-02 & Paku ${nodeId}`}
          pageTitle={`Diagnostik Sensor & Panduan Injeksi: Node ${nodeId}`}
        />

        <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Status Badges Strip matching Layar 2 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Peta Komando</span>
              </Link>

              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                  isNormalNode
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isNormalNode ? "bg-emerald-600" : "bg-red-600 animate-pulse"
                  }`}
                />
                {isNormalNode
                  ? "STATUS: LAHAN GAMBUT STABIL & AMAN"
                  : "STATUS: BARA BAWAH TANAH TERKONFIRMASI"}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                DS18B20 1-Wire Bus | Baterai {battVolts}V | Sinyal LoRa Kuat
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs font-mono text-slate-500">
              Memuat diagnostik sensor {nodeId}...
            </div>
          ) : (
            <>
              {/* Top 2-Column Charts Grid matching Layar 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Card: Carbon Monoxide Monitoring */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                        Carbon Monoxide Monitoring
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Deteksi dini pelepasan gas pembakaran tanpa lidah api di permukaan tanah.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-extrabold font-mono text-red-600 leading-none">
                        {coPeak} ppm
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        Tiang CO-02 · 24 jam
                      </div>
                    </div>
                  </div>

                  {/* Clean SVG 24-Hour CO Monitoring Chart matching Layar 2 */}
                  <div className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
                    <svg viewBox="0 0 520 210" className="w-full h-48 select-none">
                      <defs>
                        <linearGradient id="coAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#DC2626" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>

                      {/* Shaded Nighttime Band (Malam: 18:00 - 06:00) */}
                      <rect x="275" y="18" width="220" height="156" fill="#E2E8F0" fillOpacity="0.45" rx="4" />
                      <text x="370" y="32" fill="#64748B" fontSize="10" fontWeight="600">
                        Malam
                      </text>

                      {/* Horizontal Grid Lines (0, 50, 100, 150, 200 ppm) */}
                      {[
                        { y: 174, label: "0" },
                        { y: 135, label: "50" },
                        { y: 96, label: "100" },
                        { y: 57, label: "150" },
                        { y: 18, label: "200" },
                      ].map((row) => (
                        <g key={row.label}>
                          <line
                            x1="44"
                            y1={row.y}
                            x2="495"
                            y2={row.y}
                            stroke="#CBD5E1"
                            strokeWidth="0.8"
                            strokeDasharray="3,3"
                          />
                          <text
                            x="36"
                            y={row.y + 3}
                            textAnchor="end"
                            fill="#64748B"
                            fontSize="10"
                            fontFamily="monospace"
                          >
                            {row.label}
                          </text>
                        </g>
                      ))}

                      {/* Y-Axis Label */}
                      <text
                        x="12"
                        y="100"
                        fill="#64748B"
                        fontSize="9"
                        fontFamily="monospace"
                        transform="rotate(-90 12 100)"
                      >
                        ppm
                      </text>

                      {/* Ambang Batas Bahaya Smouldering (100 ppm) Dashed Red Line */}
                      <line
                        x1="44"
                        y1="96"
                        x2="495"
                        y2="96"
                        stroke="#DC2626"
                        strokeWidth="1.5"
                        strokeDasharray="6,4"
                      />
                      <text
                        x="52"
                        y="90"
                        fill="#B91C1C"
                        fontSize="10"
                        fontWeight="700"
                      >
                        Ambang Batas Bahaya Smouldering (100 ppm)
                      </text>

                      {/* CO Curve Area & Stroke (15 ppm -> 185 ppm) */}
                      <path
                        d="M 44 162 L 120 160 L 196 157 L 275 148 C 325 135, 355 96, 395 62 C 435 38, 465 32, 495 29 L 495 174 L 44 174 Z"
                        fill="url(#coAreaGrad)"
                      />
                      <path
                        d="M 44 162 L 120 160 L 196 157 L 275 148 C 325 135, 355 96, 395 62 C 435 38, 465 32, 495 29"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />

                      {/* Key Data Points */}
                      <circle cx="44" cy="162" r="3.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="350" cy="96" r="4" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="495" cy="29" r="5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />

                      {/* X-Axis Timestamps */}
                      {[
                        { x: 44, t: "06:00" },
                        { x: 119, t: "10:00" },
                        { x: 194, t: "14:00" },
                        { x: 269, t: "18:00" },
                        { x: 344, t: "22:00" },
                        { x: 419, t: "02:00" },
                        { x: 495, t: "06:00" },
                      ].map((col, idx) => (
                        <text
                          key={idx}
                          x={col.x}
                          y="194"
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {col.t}
                        </text>
                      ))}
                    </svg>
                  </div>

                  {/* Bottom Summary Strip */}
                  <div className="px-3.5 py-2.5 rounded-xl bg-red-50/70 border border-red-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono font-bold text-red-800">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      <span>15 → {coPeak} ppm</span>
                    </div>
                    <span className="text-red-700 font-medium">
                      Lonjakan CO pada malam hari
                    </span>
                  </div>
                </div>

                {/* Right Card: Multi-Depth Temperature Sensor */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                        Multi-Depth Temperature Sensor
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Paku {nodeId} · Perbandingan suhu tanah
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">24 jam</span>
                  </div>

                  {/* Clean SVG Multi-Depth Temperature Chart (0..600°C) matching Layar 2 */}
                  <div className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
                    <svg viewBox="0 0 520 190" className="w-full h-44 select-none">
                      {/* Horizontal Grid Lines (0, 200, 400, 600 °C) */}
                      {[
                        { y: 156, label: "0" },
                        { y: 110, label: "200" },
                        { y: 64, label: "400" },
                        { y: 18, label: "600" },
                      ].map((row) => (
                        <g key={row.label}>
                          <line
                            x1="44"
                            y1={row.y}
                            x2="495"
                            y2={row.y}
                            stroke="#CBD5E1"
                            strokeWidth="0.8"
                            strokeDasharray="3,3"
                          />
                          <text
                            x="36"
                            y={row.y + 3}
                            textAnchor="end"
                            fill="#64748B"
                            fontSize="10"
                            fontFamily="monospace"
                          >
                            {row.label}
                          </text>
                        </g>
                      ))}

                      <text
                        x="12"
                        y="92"
                        fill="#64748B"
                        fontSize="9"
                        fontFamily="monospace"
                        transform="rotate(-90 12 92)"
                      >
                        °C
                      </text>

                      {/* 50 cm Curve (Red - Pyrolysis rising to 542°C) */}
                      <path
                        d="M 44 145 C 140 142, 210 128, 280 96 C 350 64, 420 38, 495 31"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                      <circle cx="495" cy="31" r="4.5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />

                      {/* 100 cm Curve (Amber dashed rising to 68°C) */}
                      <path
                        d="M 44 149 C 180 148, 320 144, 495 139"
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="2"
                        strokeDasharray="5,4"
                      />
                      <circle cx="495" cy="139" r="3.5" fill="#D97706" stroke="#FFFFFF" strokeWidth="1.2" />

                      {/* 20 cm Curve (Green flat at 34°C) */}
                      <path
                        d="M 44 148 L 495 148"
                        fill="none"
                        stroke="#16A34A"
                        strokeWidth="2.2"
                      />
                      <circle cx="495" cy="148" r="3.5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="1.2" />

                      {/* X-Axis Timestamps */}
                      {[
                        { x: 44, t: "06:00" },
                        { x: 119, t: "10:00" },
                        { x: 194, t: "14:00" },
                        { x: 269, t: "18:00" },
                        { x: 344, t: "22:00" },
                        { x: 419, t: "02:00" },
                        { x: 495, t: "06:00" },
                      ].map((col, idx) => (
                        <text
                          key={idx}
                          x={col.x}
                          y="176"
                          textAnchor="middle"
                          fill="#64748B"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {col.t}
                        </text>
                      ))}
                    </svg>
                  </div>

                  {/* 3 Depth Breakdown Rows matching Layar 2 */}
                  <div className="space-y-1.5 text-xs">
                    {/* 20 cm */}
                    <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-3 h-0.5 bg-emerald-600 inline-block shrink-0" />
                        <span className="font-mono font-bold text-slate-700 w-12 shrink-0">
                          20 cm
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          Lapisan Serasah Atas
                        </span>
                        <span className="text-slate-400 text-[11px] hidden sm:inline truncate">
                          (Tampak dingin/aman di permukaan)
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-slate-900 shrink-0">
                        {t20}°C
                      </span>
                    </div>

                    {/* 50 cm */}
                    <div className="px-3 py-2 rounded-lg bg-red-50/80 border border-red-200 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-3 h-0.5 bg-red-600 inline-block shrink-0" />
                        <span className="font-mono font-bold text-red-700 w-12 shrink-0">
                          50 cm
                        </span>
                        <span className="font-bold text-slate-900 truncate">
                          Zona Pirolisis Tengah
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold uppercase shrink-0">
                          BARA AKTIF!
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-red-600 text-sm shrink-0">
                        {t50}°C
                      </span>
                    </div>

                    {/* 100 cm */}
                    <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-3 h-0.5 bg-amber-600 inline-block shrink-0" />
                        <span className="font-mono font-bold text-slate-700 w-12 shrink-0">
                          100 cm
                        </span>
                        <span className="font-semibold text-slate-800 truncate">
                          Lapisan Gambut Dalam
                        </span>
                        <span className="text-slate-400 text-[11px] hidden sm:inline truncate">
                          (Mulai menghangat)
                        </span>
                      </div>
                      <span className="font-mono font-extrabold text-amber-800 shrink-0">
                        {t100}°C
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Full-Width Card: Panduan Injeksi Air Presisi (Peat Nozzle Guide) matching Layar 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-emerald-700" />
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Panduan Injeksi Air Presisi (Peat Nozzle Guide)
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      Rekomendasi Injeksi Real-Time
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLogForm(!showLogForm)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{showLogForm ? "Tutup Form Log" : "Catat Suntik Air"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  {/* Left: Cross-Section Diagram (5 cols) */}
                  <div className="lg:col-span-5">
                    <PeatCrossSectionSvg
                      t20={t20}
                      t50={t50}
                      t100={t100}
                      waterTableCm={-55}
                      highlightDepth={50}
                      interactive={false}
                    />
                  </div>

                  {/* Right: 3 Recommendation Cards (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90">
                      <span className="text-xs text-slate-500 font-medium block">
                        Target Kedalaman Suntik (Peat Nozzle)
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">
                        50 cm (Zona Pirolisis Utama)
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90">
                      <span className="text-xs text-slate-500 font-medium block">
                        Estimasi Volume Air Presisi
                      </span>
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                        <span className="text-lg sm:text-xl font-extrabold text-slate-900">
                          120 Liter / titik
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">
                          (Hemat 55% dibanding siram permukaan)
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Status Permukaan</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-red-700 leading-snug">
                        Tampak Aman di Permukaan ({t20}°C, Tanpa Asap) - Wajib Injeksi Bawah Tanah
                      </div>
                    </div>

                    {/* Optional Field Action Logger */}
                    {showLogForm && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="text-xs font-bold text-slate-800">
                          Rekam Tindakan Injeksi Regu Manggala Agni ({nodeId})
                        </div>
                        {actionSuccess ? (
                          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Tindakan suntik air tercatat ke Safety Log &amp; Audit KLHK.</span>
                          </div>
                        ) : (
                          <form onSubmit={handleRecordAction} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                            <input
                              type="number"
                              value={waterLiters}
                              onChange={(e) => setWaterLiters(Number(e.target.value))}
                              placeholder="Liter air"
                              className="bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-900"
                            />
                            <input
                              type="text"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              placeholder="Catatan lapangan..."
                              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-lg bg-[#0D2B1D] hover:bg-[#143d29] text-white font-bold flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Simpan Log</span>
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Bottom Footer Bar matching Layar 2 */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-2.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            Sistem Telemetri Subsurface · Tiang Gas CO &amp; Paku Sensor Multi-Kedalaman
          </div>
          <div className="font-mono text-slate-400">
            Long-Range Data Transmission · LoRaWAN
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function NodeDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center text-xs font-mono text-slate-500">
          Memuat diagnostik titik sensor...
        </div>
      }
    >
      <NodeDetailContent />
    </Suspense>
  );
}
