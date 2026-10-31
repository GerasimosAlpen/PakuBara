"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { CommandMap, MapNode, MapHotspot } from "@/components/map/CommandMap";
import { TimelineReplayBar } from "@/components/map/TimelineReplayBar";
import {
  Flame,
  Radio,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  X,
  Droplets,
  Activity,
} from "lucide-react";

export default function AppCommandPage() {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("a0000000-0000-0000-0000-000000000001");
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch nodes & hotspots
  useEffect(() => {
    async function loadData() {
      try {
        const [nodesRes, hotspotsRes] = await Promise.all([
          fetch("/api/nodes"),
          fetch("/api/layers/hotspots"),
        ]);
        const nodesData = await nodesRes.json();
        const hotspotsData = await hotspotsRes.json();

        const nodesList = Array.isArray(nodesData?.data)
          ? nodesData.data
          : Array.isArray(nodesData)
          ? nodesData
          : [];
        setNodes(nodesList);

        // Select initial focus node
        const initialNode = nodesList.find((n: MapNode) => n.id === "PK-04") || nodesList[0];
        if (initialNode) setSelectedNode(initialNode);

        const hotspotsList = Array.isArray(hotspotsData?.data)
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
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    if (areaId === "a0000000-0000-0000-0000-000000000003") {
      const pkk03 = nodes.find((n) => n.id === "PK-K03");
      if (pkk03) setSelectedNode(pkk03);
    } else if (areaId === "a0000000-0000-0000-0000-000000000001") {
      const pk04 = nodes.find((n) => n.id === "PK-04");
      if (pk04) setSelectedNode(pk04);
    }
  };

  const isKalimantan = selectedAreaId === "a0000000-0000-0000-0000-000000000003";
  const isAll = selectedAreaId === "all";

  const activeAreaName = isKalimantan
    ? "KHG Kahayan - Sebangau (Kalteng)"
    : isAll
    ? "Semua Wilayah Operasi (Lintas KHG)"
    : "Blok B Pulau Padang (Riau)";

  const displayedNodes = isAll ? nodes : nodes.filter((n) => n.area_id === selectedAreaId);
  const probeCount = displayedNodes.filter((n) => n.type === "probe").length;
  const gasCount = displayedNodes.filter((n) => n.type === "gas").length;
  const activeNodesCount = displayedNodes.filter((n) => n.status === "active").length;

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
        etaHours: 11.9,
      };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col select-none">
      <AppNavbar
        activeAreaName={activeAreaName}
        activeAreaId={selectedAreaId}
        onSelectArea={handleSelectArea}
      />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        {/* Command Center Main Workspace */}
        <main className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* 4 Strip KPI Ringkas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Titik Pantau LoRa
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-slate-100">
                  {displayedNodes.length || (isAll ? 20 : 10)}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium">
                  {probeCount || (isAll ? 16 : 8)} Paku + {gasCount || (isAll ? 4 : 2)} Tiang Gas
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-800 border border-slate-700/70 text-emerald-400">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Bara Aktif (≥60°C)
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-red-400">
                  {activeNodesCount || (isAll ? 2 : 1)} Titik
                </span>
                <span className="text-[10px] text-red-300 block mt-0.5 font-medium truncate max-w-[150px]">
                  {isKalimantan
                    ? "PK-K03 (89.6°C, 50cm)"
                    : isAll
                    ? "PK-04 & PK-K03 Aktif"
                    : "PK-04 (87.3°C, 50cm)"}
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Alert Terbuka
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-amber-400">
                  {activeNodesCount || (isAll ? 2 : 1)} Insiden
                </span>
                <span className="text-[10px] text-amber-300 block mt-0.5 font-medium">
                  {isKalimantan ? "Sebangau Siaga Darurat" : "Menunggu respon regu"}
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Kawasan Stabil
                </span>
                <span className="text-lg sm:text-xl font-mono font-bold text-sky-400">
                  {isKalimantan ? "0 dari 3 Hari" : "1 dari 3 Hari"}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Permen LHK P.32/2016
                </span>
              </div>
              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-800 border border-slate-700/70 text-sky-400">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>

          {/* Interactive Map & Floating Drawer Section */}
          <div className="relative flex-1 min-h-[500px] sm:min-h-[560px] rounded-xl overflow-hidden border border-slate-800">
            <CommandMap
              nodes={nodes}
              hotspots={hotspots}
              selectedNodeId={selectedNode?.id}
              onSelectNode={(node) => setSelectedNode(node)}
              activeAreaId={selectedAreaId}
              onSelectArea={handleSelectArea}
              spreadVector={spreadVector}
              wind={{ speedKmh: 14.2, directionDeg: isKalimantan ? 310 : 220 }}
            />

            {/* Timeline Scrub Bar (Docked at Map Bottom) */}
            <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-20 max-w-2xl mx-auto">
              <TimelineReplayBar
                onTimeChange={(hourOffset) => {
                  // scrub handling
                }}
              />
            </div>

            {/* Floating Drawer Detail Titik Terpilih */}
            {selectedNode && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-2xl animate-fadeIn space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedNode.status === "active"
                          ? "bg-red-500"
                          : selectedNode.status === "watch"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span className="text-sm font-bold font-mono text-slate-100">
                      TITIK {selectedNode.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({selectedNode.type === "probe" ? "Paku Suhu" : "Tiang Gas"})
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Suhu 20cm</span>
                    <span className="font-mono font-bold text-amber-400">
                      {selectedNode.last_reading.t20 ?? "-"}°
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Suhu 50cm</span>
                    <span className="font-mono font-bold text-red-400">
                      {selectedNode.last_reading.t50 ?? "-"}°
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Suhu 100cm</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {selectedNode.last_reading.t100 ?? "-"}°
                    </span>
                  </div>
                </div>

                {selectedNode.last_reading.co !== undefined && (
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Gas Karbon Monoksida:</span>
                    <span className="font-mono font-bold text-sky-400">
                      {selectedNode.last_reading.co} ppm
                    </span>
                  </div>
                )}

                {selectedNode.id === "PK-04" && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 text-[11px] text-red-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-300">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span>Prediksi Rambat Bara Aktif</span>
                    </div>
                    <div>Arah: 45° (Timur Laut) | ETA: 11.9 jam ke PK-05</div>
                    <div>Rekomendasi: Injeksi pipa air 600L pada kedalaman 50cm</div>
                  </div>
                )}

                {selectedNode.id === "PK-K03" && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 text-[11px] text-red-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-red-300">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span>Prediksi Rambat Bara Aktif (Sebangau)</span>
                    </div>
                    <div>Arah: 135° (Tenggara) | ETA: 9.2 jam ke koridor PK-K04</div>
                    <div>Rekomendasi: Injeksi pipa air 800L pada kedalaman 50cm</div>
                  </div>
                )}

                <Link
                  href={`/app/nodes/${selectedNode.id}`}
                  className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Buka Grafik & Analisis Lengkap</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

