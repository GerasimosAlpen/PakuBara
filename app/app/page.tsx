"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { CommandMap, MapNode, MapHotspot } from "@/components/map/CommandMap";
import { InMapSimulatorModal } from "@/components/simulator/InMapSimulatorModal";
import {
  Flame,
  Radio,
  Wind,
  Droplets,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Map as MapIcon,
  Layers,
  Sliders,
  Activity,
} from "lucide-react";

interface SectorPin {
  id: string;
  sector: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  state: "aman" | "co" | "bara";
  t20: number;
  t50: number;
  t100: number;
  coPpm: number;
  rssi: number;
  snr: number;
  battV: number;
  gpsLabel: string;
}

const RIAU_SECTOR_PINS: SectorPin[] = [
  { id: "PK-01", sector: "A-01", x: 18, y: 20, state: "aman", t20: 29, t50: 30, t100: 29, coPpm: 12, rssi: -79, snr: 8.2, battV: 3.9, gpsLabel: "0°58'19.1\"N 102°23'54.2\"E" },
  { id: "PK-02", sector: "A-02", x: 35, y: 18, state: "aman", t20: 30, t50: 31, t100: 30, coPpm: 14, rssi: -80, snr: 8.0, battV: 3.9, gpsLabel: "0°58'18.4\"N 102°24'01.0\"E" },
  { id: "PK-03", sector: "A-03", x: 59, y: 23, state: "co", t20: 33, t50: 48, t100: 35, coPpm: 118, rssi: -83, snr: 7.4, battV: 3.8, gpsLabel: "0°58'16.8\"N 102°24'11.3\"E" },
  { id: "PK-04", sector: "B-04", x: 46, y: 50, state: "bara", t20: 34, t50: 542, t100: 68, coPpm: 185, rssi: -84, snr: 7.5, battV: 3.8, gpsLabel: "0°58'12.4\"N 102°24'08.1\"E" },
  { id: "PK-05", sector: "B-04", x: 54, y: 59, state: "bara", t20: 35, t50: 468, t100: 62, coPpm: 164, rssi: -85, snr: 7.1, battV: 3.8, gpsLabel: "0°58'10.9\"N 102°24'10.5\"E" },
  { id: "PK-06", sector: "B-01", x: 20, y: 56, state: "aman", t20: 29, t50: 31, t100: 30, coPpm: 10, rssi: -81, snr: 7.9, battV: 3.9, gpsLabel: "0°58'11.2\"N 102°23'56.0\"E" },
  { id: "PK-07", sector: "B-03", x: 64, y: 42, state: "co", t20: 32, t50: 52, t100: 37, coPpm: 132, rssi: -82, snr: 7.6, battV: 3.8, gpsLabel: "0°58'14.0\"N 102°24'14.2\"E" },
  { id: "PK-08", sector: "A-04", x: 75, y: 31, state: "co", t20: 33, t50: 56, t100: 38, coPpm: 148, rssi: -86, snr: 6.9, battV: 3.8, gpsLabel: "0°58'16.1\"N 102°24'18.9\"E" },
  { id: "PK-09", sector: "C-02", x: 39, y: 69, state: "bara", t20: 34, t50: 455, t100: 59, coPpm: 152, rssi: -84, snr: 7.2, battV: 3.7, gpsLabel: "0°58'08.3\"N 102°24'04.7\"E" },
  { id: "PK-10", sector: "C-01", x: 16, y: 80, state: "aman", t20: 28, t50: 30, t100: 29, coPpm: 9, rssi: -80, snr: 8.1, battV: 3.9, gpsLabel: "0°58'05.5\"N 102°23'53.8\"E" },
  { id: "PK-11", sector: "C-03", x: 62, y: 79, state: "aman", t20: 29, t50: 31, t100: 30, coPpm: 11, rssi: -82, snr: 7.8, battV: 3.9, gpsLabel: "0°58'05.9\"N 102°24'13.4\"E" },
  { id: "PK-12", sector: "B-05", x: 84, y: 60, state: "aman", t20: 30, t50: 32, t100: 30, coPpm: 15, rssi: -85, snr: 7.0, battV: 3.8, gpsLabel: "0°58'10.1\"N 102°24'22.0\"E" },
];

export default function AppCommandPage() {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [selectedPin, setSelectedPin] = useState<SectorPin>(RIAU_SECTOR_PINS[3]); // PK-04 default
  const [selectedAreaId, setSelectedAreaId] = useState<string>("a0000000-0000-0000-0000-000000000001");
  const [mapMode, setMapMode] = useState<"topography" | "gis">("topography");
  const [showSimulatorModal, setShowSimulatorModal] = useState<boolean>(false);
  const [dispatchSent, setDispatchSent] = useState<boolean>(false);
  const [dispatchLoading, setDispatchLoading] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [nodesRes, hotspotsRes] = await Promise.all([
        fetch("/api/nodes"),
        fetch("/api/layers/hotspots"),
      ]);
      const nodesData = await nodesRes.json();
      const hotspotsData = await hotspotsRes.json();

      const nodesList: MapNode[] = Array.isArray(nodesData?.data)
        ? nodesData.data
        : Array.isArray(nodesData)
        ? nodesData
        : [];
      setNodes(nodesList);

      const hotspotsList: MapHotspot[] = Array.isArray(hotspotsData?.data)
        ? hotspotsData.data
        : Array.isArray(hotspotsData?.features)
        ? hotspotsData.features.map((f: any) => ({
            id: f.id || f.properties?.id,
            lat: f.geometry?.coordinates?.[1] || 0,
            lon: f.geometry?.coordinates?.[0] || 0,
            frp: f.properties?.frp || 20,
            confidence: f.properties?.confidence || "high",
          }))
        : Array.isArray(hotspotsData)
        ? hotspotsData
        : [];
      setHotspots(hotspotsList);
    } catch (err) {
      console.error("Gagal memuat data peta komando:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    if (areaId === "a0000000-0000-0000-0000-000000000003" || areaId === "all") {
      setMapMode("gis");
    }
  };

  const handleDispatchRegu = async () => {
    setDispatchLoading(true);
    try {
      await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedPin.id,
          kind: "injection",
          water_liters: 450,
          depth_cm: 50,
          note: `Instruksi suntik air 450L dikirim ke Regu Manggala Agni untuk ${selectedPin.id} (${selectedPin.sector})`,
        }),
      });
      setDispatchSent(true);
      setTimeout(() => setDispatchSent(false), 5000);
    } catch {
      setDispatchSent(true);
      setTimeout(() => setDispatchSent(false), 5000);
    } finally {
      setDispatchLoading(false);
    }
  };

  const isKalimantan = selectedAreaId === "a0000000-0000-0000-0000-000000000003";
  const isAll = selectedAreaId === "all";

  const activeAreaName = isKalimantan
    ? "Sektor KHG Kahayan - Sebangau (Kalteng)"
    : isAll
    ? "Semua Wilayah Operasi (Lintas KHG)"
    : "Sektor KHG Pulau Padang";

  const liveNodeMatch = nodes.find((n) => n.id === selectedPin.id);
  const displayT50 =
    liveNodeMatch?.last_reading?.t50 && liveNodeMatch.last_reading.t50 > 100
      ? liveNodeMatch.last_reading.t50
      : selectedPin.t50;

  const spreadVector = isKalimantan
    ? {
        origin: [113.9315, -2.3045] as [number, number],
        directionDeg: 135,
        distanceMeters: 240,
        etaHours: 9.2,
      }
    : {
        origin: [102.6789, -1.2345] as [number, number],
        directionDeg: 45,
        distanceMeters: 220,
        etaHours: 8.0,
      };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          activeAreaName={activeAreaName}
          activeAreaId={selectedAreaId}
          onSelectArea={handleSelectArea}
          breadcrumb="PUSAT OPERASI / PETA KOMANDO"
          pageTitle={`Interactive Peat Fire Dashboard: ${activeAreaName}`}
        />

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* 4 Top KPI Strip Cards matching Layar 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Node Aktif</span>
                <Radio className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {isKalimantan ? "8 Paku & 2 Tiang CO" : "24 Paku & 6 Tiang CO"}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  LoRaWAN Online
                </span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Titik Bara Kritis</span>
                <Flame className="w-4 h-4 text-red-600" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-red-600 tracking-tight">
                  {isKalimantan ? "1 Titik" : "3 Titik"}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  Suhu &gt;450°C
                </span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Kadar CO Tertinggi</span>
                <Wind className="w-4 h-4 text-amber-600" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-amber-700 tracking-tight">
                  {selectedPin.coPpm > 100 ? `${selectedPin.coPpm} ppm` : "185 ppm"}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  Sektor {selectedPin.sector}
                </span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Rekomendasi Air</span>
                <Droplets className="w-4 h-4 text-sky-600" />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-sky-600 tracking-tight">
                  450 Liter
                </span>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  Hemat 52%
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Main Grid: Left Map Card (8 cols) + Right Priority Cluster Detail Card (4 cols) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
            {/* Left Map Card */}
            <div className="xl:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden">
              {/* Map Card Header */}
              <div className="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="font-bold text-slate-900">Peta Komando</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500 font-medium">
                    {isKalimantan ? "KHG Kahayan - Sebangau" : "KHG Pulau Padang"}
                  </span>
                </div>

                {/* Mode Switcher: Topografi & Sensor vs Peta Satelit GIS */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                    <button
                      onClick={() => setMapMode("topography")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        mapMode === "topography"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Topografi & sensor</span>
                    </button>
                    <button
                      onClick={() => setMapMode("gis")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        mapMode === "gis"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5 text-sky-600" />
                      <span>Satelit GIS</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowSimulatorModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Simulator Paku</span>
                  </button>
                </div>
              </div>

              {/* Map Viewport */}
              {mapMode === "topography" ? (
                <div className="relative flex-1 min-h-[460px] sm:min-h-[520px] bg-[#E3EEE0] overflow-hidden select-none">
                  {/* Topographic Contours & Sector Grid SVG */}
                  <svg
                    viewBox="0 0 900 560"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                  >
                    <defs>
                      <pattern id="sectorGrid" width="180" height="140" patternUnits="userSpaceOnUse">
                        <path
                          d="M 180 0 L 0 0 0 140"
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="0.9"
                          strokeDasharray="4,4"
                          strokeOpacity="0.55"
                        />
                      </pattern>
                      <radialGradient id="baraHeatSpot" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.42" />
                        <stop offset="55%" stopColor="#F97316" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                      </radialGradient>
                      <marker
                        id="spreadArrowHead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="7"
                        refY="3.5"
                        orient="auto"
                      >
                        <polygon points="0 0, 8 3.5, 0 7" fill="#EA580C" />
                      </marker>
                    </defs>

                    {/* Base Peatland Topographic Contours */}
                    <rect width="900" height="560" fill="#E5EFE1" />
                    <path
                      d="M -40 80 Q 180 20, 380 90 T 820 60 L 940 180 L 940 560 L -40 560 Z"
                      fill="#DCEAD7"
                    />
                    <path
                      d="M -20 220 Q 220 150, 460 240 T 920 200 L 920 560 L -20 560 Z"
                      fill="#D3E4CD"
                    />
                    <path
                      d="M 60 360 Q 290 290, 560 380 T 920 350 L 920 560 L 60 560 Z"
                      fill="#DFECDC"
                    />
                    {/* Subtle organic contour lines */}
                    <path
                      d="M 0 130 Q 240 60, 490 140 T 900 110"
                      fill="none"
                      stroke="#B7CEB0"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 0 290 Q 260 220, 520 300 T 900 260"
                      fill="none"
                      stroke="#B7CEB0"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 0 430 Q 310 370, 610 450 T 900 410"
                      fill="none"
                      stroke="#B7CEB0"
                      strokeWidth="1.2"
                    />

                    {/* Sector Dashed Grid Overlay */}
                    <rect width="900" height="560" fill="url(#sectorGrid)" />

                    {/* Winding Peat River (Alur air gambut) */}
                    <path
                      d="M 0 118 C 160 125, 220 210, 360 235 C 500 260, 570 395, 730 435 C 810 455, 860 490, 910 515"
                      fill="none"
                      stroke="#BAE6FD"
                      strokeWidth="22"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 118 C 160 125, 220 210, 360 235 C 500 260, 570 395, 730 435 C 810 455, 860 490, 910 515"
                      fill="none"
                      stroke="#7DD3FC"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />

                    {/* Watermarks & Labels */}
                    <text
                      x="38"
                      y="305"
                      fill="#64748B"
                      fillOpacity="0.55"
                      fontSize="13"
                      fontWeight="700"
                      letterSpacing="3"
                    >
                      HUTAN GAMBUT
                    </text>
                    <text
                      x="390"
                      y="368"
                      fill="#64748B"
                      fillOpacity="0.45"
                      fontSize="13"
                      fontWeight="700"
                      letterSpacing="3"
                    >
                      KHG PULAU PADANG
                    </text>
                    <text
                      x="185"
                      y="175"
                      fill="#0369A1"
                      fillOpacity="0.75"
                      fontSize="12"
                      fontStyle="italic"
                      fontWeight="600"
                      transform="rotate(24 185 175)"
                    >
                      Alur air gambut
                    </text>

                    {/* Sector Grid Codes */}
                    <text x="16" y="24" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">A-01</text>
                    <text x="196" y="24" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">A-02</text>
                    <text x="556" y="24" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">A-04</text>
                    <text x="16" y="164" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">B-01</text>
                    <text x="376" y="270" fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="700">B-04</text>
                    <text x="556" y="270" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">B-03</text>
                    <text x="736" y="270" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">B-05</text>
                    <text x="16" y="440" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">C-01</text>
                    <text x="196" y="440" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">C-02</text>
                    <text x="556" y="440" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">C-03</text>
                    <text x="736" y="440" fill="#64748B" fontSize="11" fontFamily="monospace" fontWeight="600">C-04</text>

                    {/* Northeast BATAS DESA Dashed Line */}
                    <line
                      x1="670"
                      y1="20"
                      x2="865"
                      y2="145"
                      stroke="#DC2626"
                      strokeWidth="2"
                      strokeDasharray="6,5"
                    />
                    <text
                      x="755"
                      y="62"
                      fill="#B91C1C"
                      fontSize="11"
                      fontWeight="800"
                      letterSpacing="1.5"
                      transform="rotate(32 755 62)"
                    >
                      BATAS DESA
                    </text>

                    {/* Thermal Glow under PK-04, PK-05, PK-09 */}
                    <circle cx="414" cy="280" r="85" fill="url(#baraHeatSpot)" />
                    <circle cx="486" cy="330" r="65" fill="url(#baraHeatSpot)" />
                    <circle cx="351" cy="386" r="60" fill="url(#baraHeatSpot)" />

                    {/* Fire Spread Prediction Vector Arrow from PK-04 (414,280) toward PK-08 (675,173) */}
                    <line
                      x1="418"
                      y1="276"
                      x2="645"
                      y2="184"
                      stroke="#EA580C"
                      strokeWidth="3.5"
                      strokeDasharray="8,5"
                      markerEnd="url(#spreadArrowHead)"
                    />
                  </svg>

                  {/* Floating Callout Card for Fire Spread Prediction matching Layar 1 */}
                  <div className="absolute left-[46%] top-[15%] sm:left-[48%] sm:top-[16%] z-20 max-w-[235px] sm:max-w-[260px] bg-white/95 backdrop-blur-xs border-2 border-orange-400 rounded-xl px-3 py-2 shadow-md pointer-events-none">
                    <div className="text-[11px] font-extrabold text-orange-950 leading-snug">
                      Fire Spread Prediction: 4,2 cm/jam ke arah Timur Laut
                    </div>
                    <div className="text-[11px] font-semibold text-orange-800 mt-0.5">
                      (Menuju Batas Desa)
                    </div>
                  </div>

                  {/* Compass North Indicator */}
                  <div className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-[10px] font-bold text-slate-700">
                    <span>N</span>
                    <span className="text-[8px] text-slate-400 leading-none">▲</span>
                  </div>

                  {/* Interactive Sensor Nodes Overlay */}
                  {RIAU_SECTOR_PINS.map((pin) => {
                    const isSelected = selectedPin.id === pin.id;
                    const isBara = pin.state === "bara";
                    const isCo = pin.state === "co";

                    return (
                      <button
                        key={pin.id}
                        type="button"
                        onClick={() => setSelectedPin(pin)}
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group focus:outline-none"
                        title={`Node ${pin.id} (${pin.sector}) - Suhu 50cm: ${pin.t50}°C`}
                      >
                        {/* Concentric Pulsing Rings for Bara / CO nodes */}
                        {isBara && (
                          <>
                            <span className="absolute -inset-4 rounded-full bg-red-500/20 border border-red-500/40 animate-ping" />
                            <span className="absolute -inset-2.5 rounded-full bg-red-500/25 border border-red-500/50" />
                          </>
                        )}
                        {isCo && (
                          <span className="absolute -inset-2 rounded-full bg-amber-500/20 border border-amber-500/40" />
                        )}

                        <div className="relative flex items-center gap-1">
                          {/* Pin Circle */}
                          <span
                            className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm block ${
                              isBara
                                ? "bg-red-600"
                                : isCo
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                          />

                          {/* Node Label Pill */}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shadow-2xs transition-transform group-hover:scale-105 ${
                              isSelected
                                ? "bg-slate-900 text-white ring-2 ring-slate-900/20"
                                : isBara
                                ? "bg-white/95 text-red-700 border border-red-300"
                                : isCo
                                ? "bg-white/95 text-amber-800 border border-amber-300"
                                : "bg-white/90 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {pin.id}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Scale Bar & GPS Readout Bottom Right */}
                  <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-slate-600 flex items-center gap-3 shadow-2xs">
                    <div className="flex items-center gap-1.5">
                      <span>0</span>
                      <span className="w-10 h-1 bg-slate-600 inline-block rounded-xs" />
                      <span>250 m</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span>{selectedPin.gpsLabel}</span>
                  </div>
                </div>
              ) : (
                <div className="relative flex-1 min-h-[460px] sm:min-h-[520px]">
                  <CommandMap
                    nodes={nodes}
                    hotspots={hotspots}
                    selectedNodeId={selectedPin.id}
                    onSelectNode={(node) => {
                      const match = RIAU_SECTOR_PINS.find((p) => p.id === node.id);
                      if (match) {
                        setSelectedPin(match);
                      } else {
                        setSelectedPin({
                          id: node.id,
                          sector: node.id.includes("K") ? "SEBANGAU-03" : "B-04",
                          x: 50,
                          y: 50,
                          state: node.status === "active" ? "bara" : node.status === "watch" ? "co" : "aman",
                          t20: node.last_reading.t20 ?? 34,
                          t50: node.last_reading.t50 ?? 89.6,
                          t100: node.last_reading.t100 ?? 43,
                          coPpm: node.last_reading.co ?? 185,
                          rssi: (node as any).rssi ?? -84,
                          snr: 7.5,
                          battV: Number(((((node as any).batt_mv ?? 3800) as number) / 1000).toFixed(1)),
                          gpsLabel: `${Math.abs(node.lat).toFixed(4)}°S ${node.lon.toFixed(4)}°E`,
                        });
                      }
                    }}
                    activeAreaId={selectedAreaId}
                    onSelectArea={handleSelectArea}
                    onOpenSimulator={() => setShowSimulatorModal(true)}
                    spreadVector={spreadVector}
                    wind={{ speedKmh: 14.2, directionDeg: isKalimantan ? 310 : 220 }}
                  />
                </div>
              )}

              {/* Map Card Bottom Legend Bar matching Layar 1 */}
              <div className="px-4 py-2.5 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    <span className="font-medium">Aman</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="font-medium">CO meningkat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                    <span className="font-medium">Bara bawah tanah</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  WGS 84 · Grid sektor
                </div>
              </div>
            </div>

            {/* Right Card: Detail Kluster Prioritas matching Layar 1 */}
            <div className="xl:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Top Status & Sector Row */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      selectedPin.state === "bara"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : selectedPin.state === "co"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedPin.state === "bara"
                          ? "bg-red-600 animate-pulse"
                          : selectedPin.state === "co"
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                      }`}
                    />
                    {selectedPin.state === "bara"
                      ? "PRIORITAS KRITIS"
                      : selectedPin.state === "co"
                      ? "WASPADA GAS CO"
                      : "STATUS NORMAL"}
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                    SEKTOR {selectedPin.sector}
                  </span>
                </div>

                {/* Title & GPS */}
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Detail Kluster Prioritas (Node {selectedPin.id})
                  </h2>
                  <div className="text-xs font-mono text-slate-500 mt-0.5">
                    {selectedPin.gpsLabel}
                  </div>
                </div>

                {/* Fire Spread Prediction Warm Box */}
                <div className="p-4 rounded-xl bg-[#FFFBEB] border border-amber-200/90 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Flame className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Fire Spread Prediction</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-amber-200/60">
                    <div>
                      <span className="text-[11px] text-amber-800/80 block">
                        Kecepatan Rambat
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 font-mono">
                        4.2 cm/jam
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-800/80 block">
                        Estimasi Tembus Permukaan
                      </span>
                      <span className="text-lg font-extrabold text-red-600 font-mono">
                        ±8 Jam
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex items-center gap-1.5 text-xs font-semibold text-amber-950">
                    <ArrowUpRight className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Timur Laut · Menuju Batas Desa</span>
                  </div>
                </div>

                {/* Subsurface Temperature Mini Summary */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-medium text-slate-500 block">20 cm (Atas)</span>
                    <span className="text-sm font-extrabold font-mono text-emerald-700">
                      {selectedPin.t20}°C
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200">
                    <span className="text-[10px] font-semibold text-red-700 block">50 cm (Inti)</span>
                    <span className="text-sm font-extrabold font-mono text-red-600">
                      {displayT50}°C
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-medium text-slate-500 block">100 cm (Dalam)</span>
                    <span className="text-sm font-extrabold font-mono text-amber-700">
                      {selectedPin.t100}°C
                    </span>
                  </div>
                </div>

                {/* LoRaWAN Node Telemetry Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">LoRaWAN Node</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Terhubung
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        RSSI
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-slate-800">
                        {selectedPin.rssi} dBm
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        SNR
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-slate-800">
                        +{selectedPin.snr} dB
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Baterai
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-slate-800">
                        {selectedPin.battV}V
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Actions Section */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700">Tindakan Taktis</div>

                {dispatchSent ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Koordinat {selectedPin.id} & panduan suntik 50 cm terkirim ke WhatsApp Regu Manggala Agni.
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDispatchRegu}
                    disabled={dispatchLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold leading-snug shadow-sm transition-colors flex items-center justify-center gap-2 text-center"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>Kirim Koordinat & Panduan Suntik ke Regu Manggala Agni</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/app/nodes/${selectedPin.id}`}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Activity className="w-3.5 h-3.5 text-sky-600" />
                    <span>Diagnostik Sensor</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowSimulatorModal(true)}
                    className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-700" />
                    <span>Simulasi Titik</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Footer Bar matching Layar 1 */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-2.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            Verifikasi darat dua lapis · Tiang CO &amp; paku sensor suhu multi-kedalaman
          </div>
          <div className="font-mono text-slate-400">
            Long-Range Data Transmission · LoRaWAN
          </div>
        </footer>
      </div>

      {/* In-Map Simulator Modal for Judges */}
      <InMapSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        onDataChanged={loadData}
        initialNodeId={selectedPin.id}
      />
    </div>
  );
}
