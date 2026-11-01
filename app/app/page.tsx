"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useOpenAlerts } from "@/components/layout/useOpenAlerts";
import { CommandMap, MapNode, MapHotspot } from "@/components/map/CommandMap";
import { TimelineReplayBar } from "@/components/map/TimelineReplayBar";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { InMapSimulatorModal } from "@/components/simulator/InMapSimulatorModal";
import { Flame, ArrowUpRight, X, FlaskConical, TriangleAlert } from "lucide-react";

interface AreaSummary {
  open_alerts_count: number;
  safe_streak_progress: { current_days: number; target_days: number };
}

interface HotspotFeature {
  id?: string;
  geometry?: { coordinates?: number[] };
  properties?: { id?: string; frp?: number; confidence?: string };
}

interface KpiItem {
  label: string;
  value: string;
  note: string;
  tone: string;
}

interface MapData {
  nodes: MapNode[];
  hotspots: MapHotspot[];
}

async function fetchMapData(): Promise<MapData> {
  const [nodesRes, hotspotsRes] = await Promise.all([
    fetch("/api/nodes"),
    fetch("/api/layers/hotspots"),
  ]);
  if (!nodesRes.ok) throw new Error(`Server membalas ${nodesRes.status}`);
  const nodesData = await nodesRes.json();
  const hotspotsData = hotspotsRes.ok ? await hotspotsRes.json() : [];

  const nodes: MapNode[] = Array.isArray(nodesData?.data)
    ? nodesData.data
    : Array.isArray(nodesData)
    ? nodesData
    : [];

  const hotspots: MapHotspot[] = Array.isArray(hotspotsData?.data)
    ? hotspotsData.data
    : Array.isArray(hotspotsData?.features)
    ? hotspotsData.features.map((f: HotspotFeature) => ({
        id: f.id || f.properties?.id,
        lat: f.geometry?.coordinates?.[1] || 0,
        lon: f.geometry?.coordinates?.[0] || 0,
        frp: f.properties?.frp || 20,
        confidence: (f.properties?.confidence || "high") as MapHotspot["confidence"],
      }))
    : Array.isArray(hotspotsData)
    ? hotspotsData
    : [];

  return { nodes, hotspots };
}

export default function AppCommandPage() {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [hotspots, setHotspots] = useState<MapHotspot[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("a0000000-0000-0000-0000-000000000001");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [summaryState, setSummaryState] = useState<{ areaId: string; data: AreaSummary | null } | null>(null);
  const [showSimulatorModal, setShowSimulatorModal] = useState<boolean>(false);
  const { count: allOpenAlerts } = useOpenAlerts();

  const applyMapData = useCallback((data: MapData) => {
    setNodes(data.nodes);
    setHotspots(data.hotspots);
    setSelectedNode((current) => {
      if (current) return current;
      return data.nodes.find((n) => n.id === "PK-04") || data.nodes[0] || null;
    });
  }, []);

  const loadData = useCallback(() => {
    return fetchMapData()
      .then(applyMapData)
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Koneksi gagal"))
      .finally(() => setLoading(false));
  }, [applyMapData]);

  useEffect(() => {
    let cancelled = false;
    fetchMapData()
      .then((data) => {
        if (!cancelled) applyMapData(data);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Koneksi gagal");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyMapData]);

  useEffect(() => {
    if (selectedAreaId === "all") return;
    let cancelled = false;
    fetch(`/api/areas/${selectedAreaId}/summary`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) setSummaryState({ areaId: selectedAreaId, data: json?.success ? json.data : null });
      })
      .catch(() => {
        if (!cancelled) setSummaryState({ areaId: selectedAreaId, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [selectedAreaId]);

  const summary = summaryState?.areaId === selectedAreaId ? summaryState.data : null;

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
  const activeNodes = displayedNodes.filter((n) => n.status === "active");
  const noData = loading || loadError !== null;

  const openAlerts = isAll ? allOpenAlerts : summary?.open_alerts_count ?? null;
  const stable = summary?.safe_streak_progress;

  const kpis: KpiItem[] = [
    {
      label: "Titik dipantau",
      value: noData ? "-" : String(displayedNodes.length),
      note: noData ? "Belum ada data" : `${probeCount} paku, ${gasCount} tiang gas`,
      tone: "text-stone-50",
    },
    {
      label: "Bara aktif",
      value: noData ? "-" : String(activeNodes.length),
      note: noData
        ? "Belum ada data"
        : activeNodes.length > 0
        ? activeNodes.map((n) => n.id).join(", ")
        : "Tidak ada titik aktif",
      tone: activeNodes.length > 0 ? "text-red-400" : "text-stone-50",
    },
    {
      label: "Alert terbuka",
      value: openAlerts === null ? "-" : String(openAlerts),
      note: openAlerts === null ? "Belum ada data" : isAll ? "Semua wilayah" : "Di wilayah ini",
      tone: openAlerts ? "text-accent" : "text-stone-50",
    },
    {
      label: "Hari stabil",
      value: stable ? `${stable.current_days} dari ${stable.target_days}` : "-",
      note: stable ? "Syarat area dinyatakan aman" : isAll ? "Pilih satu wilayah" : "Belum ada data",
      tone: "text-stone-50",
    },
  ];

  const renderKpis = (layout: "strip" | "panel") => (
    <dl className={layout === "strip" ? "grid grid-cols-2 gap-2" : "space-y-3"}>
      {kpis.map((k) => (
        <div
          key={k.label}
          className={layout === "strip" ? "p-3 rounded-lg bg-surface border border-line" : ""}
        >
          <dt className="text-xs text-stone-300">{k.label}</dt>
          <dd className={`font-mono tabular text-2xl font-bold leading-tight ${k.tone}`}>{k.value}</dd>
          <dd className="text-xs text-stone-400 truncate">{k.note}</dd>
        </div>
      ))}
    </dl>
  );

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
    <div className="min-h-screen bg-ink text-stone-100 flex flex-col select-none">
      <AppNavbar
        activeAreaName={activeAreaName}
        activeAreaId={selectedAreaId}
        onSelectArea={handleSelectArea}
      />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden p-3">{renderKpis("strip")}</div>

          <div className="relative flex-1 min-h-[520px] lg:h-[calc(100vh-3.5rem)] overflow-hidden">
            <CommandMap
              nodes={nodes}
              hotspots={hotspots}
              selectedNodeId={selectedNode?.id}
              onSelectNode={(node) => setSelectedNode(node)}
              activeAreaId={selectedAreaId}
              onSelectArea={handleSelectArea}
              onOpenSimulator={() => setShowSimulatorModal(true)}
              spreadVector={spreadVector}
              wind={{ speedKmh: 14.2, directionDeg: isKalimantan ? 310 : 220 }}
            />

            {/* Panel KPI melayang (desktop) */}
            <section
              aria-label="Ringkasan wilayah"
              className="hidden lg:block absolute top-28 left-3 z-20 w-56 bg-panel backdrop-blur-md border border-line rounded-lg p-4"
            >
              {renderKpis("panel")}
            </section>

            {loading && (
              <div
                role="status"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-4 py-2 rounded-md bg-surface border border-line text-sm text-stone-200"
              >
                Memuat titik pantau...
              </div>
            )}

            {loadError && (
              <div
                role="alert"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md p-4 rounded-lg bg-surface border border-crit text-sm"
              >
                <div className="flex items-start gap-3">
                  <TriangleAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold text-stone-50">Data titik pantau gagal dimuat</p>
                    <p className="text-stone-300 mt-1">
                      {loadError}. Peta menampilkan data terakhir yang berhasil diambil, jika ada.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadError(null);
                        setLoading(true);
                        loadData();
                      }}
                      className="mt-3 px-3 py-2 rounded-md bg-ember-strong hover:bg-ember-strong-hover text-white font-semibold"
                    >
                      Coba lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !loadError && displayedNodes.length === 0 && (
              <div
                role="status"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md p-4 rounded-lg bg-surface border border-line text-sm"
              >
                <ImageSlot
                  src="/images/kosong-titik-pantau.webp"
                  alt="Lahan gambut bekas terbakar yang belum dipasangi paku sensor"
                  width={1200}
                  height={600}
                  label="belum ada titik pantau"
                  className="mb-3"
                />
                <p className="font-semibold text-stone-50">Belum ada titik pantau di wilayah ini</p>
                <p className="text-stone-300 mt-1">
                  Daftarkan paku suhu atau tiang gas di halaman Perangkat, atau jalankan skenario di Simulator Juri.
                </p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/app/devices"
                    className="px-3 py-2 rounded-md bg-ember-strong hover:bg-ember-strong-hover text-white font-semibold"
                  >
                    Buka Perangkat
                  </Link>
                  <Link
                    href="/demo"
                    className="px-3 py-2 rounded-md border border-line-strong text-stone-100 hover:bg-raised"
                  >
                    Simulator Juri
                  </Link>
                </div>
              </div>
            )}

            {/* Bilah waktu di dasar peta */}
            <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-20 max-w-2xl mx-auto">
              <TimelineReplayBar
                onTimeChange={() => {
                  // belum terhubung ke data replay
                }}
              />
            </div>

            {/* Panel Detail Titik terpilih */}
            {selectedNode && (
              <div className="absolute z-20 inset-x-0 bottom-0 max-h-[55%] sm:inset-x-auto sm:bottom-auto sm:top-4 sm:right-4 sm:w-80 sm:max-h-[calc(100%-2rem)] overflow-y-auto bg-panel backdrop-blur-md border border-line rounded-t-lg sm:rounded-lg p-4 shadow-2xl animate-fadeIn space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedNode.status === "active"
                          ? "bg-crit"
                          : selectedNode.status === "watch"
                          ? "bg-watch"
                          : "bg-ok"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold font-mono text-stone-50">
                      Titik {selectedNode.id}
                    </span>
                    <span className="text-xs text-stone-400">
                      {selectedNode.type === "probe" ? "Paku suhu" : "Tiang gas"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    aria-label="Tutup detail titik"
                    className="w-11 h-11 -mr-2 flex items-center justify-center rounded-md hover:bg-raised text-stone-400 hover:text-stone-50"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "20 cm", value: selectedNode.last_reading.t20, tone: "text-watch" },
                    { label: "50 cm", value: selectedNode.last_reading.t50, tone: "text-red-400" },
                    { label: "100 cm", value: selectedNode.last_reading.t100, tone: "text-ok" },
                  ].map((d) => (
                    <div key={d.label} className="p-2 rounded-md bg-ink border border-line">
                      <span className="text-xs text-stone-300 block">{d.label}</span>
                      <span className={`font-mono tabular font-bold ${d.tone}`}>
                        {d.value ?? "-"}°
                      </span>
                    </div>
                  ))}
                </div>

                {selectedNode.last_reading.co !== undefined && (
                  <div className="p-2.5 rounded-md bg-ink border border-line flex justify-between items-center text-sm">
                    <span className="text-stone-300">Karbon monoksida</span>
                    <span className="font-mono tabular font-bold text-stone-50">
                      {selectedNode.last_reading.co} ppm
                    </span>
                  </div>
                )}

                {selectedNode.id === "PK-04" && (
                  <div className="p-3 rounded-md bg-crit/10 border border-crit/40 text-sm text-red-100 space-y-1">
                    <div className="font-bold flex items-center gap-2 text-red-200">
                      <Flame className="w-4 h-4" aria-hidden="true" />
                      <span>Prediksi rambat bara aktif</span>
                    </div>
                    <div>Arah 45° (timur laut), ETA 11,9 jam ke PK-05</div>
                    <div>Saran: injeksi air 600 L pada kedalaman 50 cm</div>
                  </div>
                )}

                {selectedNode.id === "PK-K03" && (
                  <div className="p-3 rounded-md bg-crit/10 border border-crit/40 text-sm text-red-100 space-y-1">
                    <div className="font-bold flex items-center gap-2 text-red-200">
                      <Flame className="w-4 h-4" aria-hidden="true" />
                      <span>Prediksi rambat bara aktif (Sebangau)</span>
                    </div>
                    <div>Arah 135° (tenggara), ETA 9,2 jam ke koridor PK-K04</div>
                    <div>Saran: injeksi air 800 L pada kedalaman 50 cm</div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowSimulatorModal(true)}
                  className="w-full py-2.5 rounded-md border border-line-strong hover:bg-raised text-stone-100 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FlaskConical className="w-4 h-4 text-accent" aria-hidden="true" />
                  <span>Uji simulasi bara di titik ini</span>
                </button>

                <Link
                  href={`/app/nodes/${selectedNode.id}`}
                  className="w-full py-2.5 rounded-md bg-ember-strong hover:bg-ember-strong-hover text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <span>Buka grafik dan analisis</span>
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <InMapSimulatorModal
        isOpen={showSimulatorModal}
        onClose={() => setShowSimulatorModal(false)}
        onDataChanged={loadData}
        initialNodeId={selectedNode?.id || "PK-04"}
      />
    </div>
  );
}
