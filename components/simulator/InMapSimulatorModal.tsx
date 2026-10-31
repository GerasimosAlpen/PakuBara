"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Flame,
  ShieldAlert,
  BatteryCharging,
  Droplets,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
} from "lucide-react";

interface InMapSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
  initialNodeId?: string;
}

const SCENARIOS = [
  {
    id: "bara_merambat",
    name: "Skenario 1: Bara Merambat Bawah Permukaan",
    badge: "Fusi 3/3 Sinyal (Valid)",
    badgeColor: "text-red-400 bg-red-950/60 border-red-800/60",
    desc: "Suhu PK-04 melonjak 92°C, probe tetangga PK-05 naik 54°C, tiang gas GS-01 185 ppm. Status AKTIF dan vektor rambat muncul.",
  },
  {
    id: "alarm_palsu_co",
    name: "Skenario 2: Filtrasi Alarm Palsu (Genset Patroli)",
    badge: "Ditolak (1 Sinyal)",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-800/60",
    desc: "Tiang gas GS-02 naik 120 ppm CO akibat knalpot, tapi suhu tanah tetap 30°C. Sistem menolak alarm, status tetap Normal.",
  },
  {
    id: "paku_mati_baterai",
    name: "Skenario 3: Deteksi Node Offline & Baterai Kritis",
    badge: "Pengawasan Terisolasi",
    badgeColor: "text-sky-400 bg-sky-950/60 border-sky-800/60",
    desc: "PK-07 drop ke bawah 3.2V dan tidak kirim denyut >30 menit. Node ditandai OFFLINE pada peta.",
  },
  {
    id: "pemulihan_area",
    name: "Skenario 4: Pemadaman Sukses & Rantai Hari Aman",
    badge: "Permen LHK P.32/2016",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/60",
    desc: "Regu melakukan injeksi air 800L pada kedalaman 50cm. Suhu turun ke 32°C dan perhitungan rantai 3 hari aman dimulai.",
  },
];

export function InMapSimulatorModal({
  isOpen,
  onClose,
  onDataChanged,
  initialNodeId = "PK-04",
}: InMapSimulatorModalProps) {
  const [selectedNode, setSelectedNode] = useState<string>(initialNodeId);
  const [targetTemp, setTargetTemp] = useState<number>(95);
  const [coPpm, setCoPpm] = useState<number>(210);
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyScenario = async (scId: string) => {
    setLoading(true);
    setToastMessage(null);
    try {
      const res = await fetch("/api/demo/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scId }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`Skenario "${data.scenario?.name || scId}" berhasil diterapkan!`);
        onDataChanged();
      } else {
        setToastMessage(`Gagal: ${data.error || "Gagal menerapkan skenario"}`);
      }
    } catch (err) {
      setToastMessage(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomHeat = async () => {
    setLoading(true);
    setToastMessage(null);
    try {
      const res = await fetch("/api/demo/heat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: selectedNode,
          target_temp: targetTemp,
          co_ppm: coPpm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`Denyut suhu ${targetTemp}°C & CO ${coPpm} ppm dikirim ke ${selectedNode}!`);
        onDataChanged();
      } else {
        setToastMessage(`Gagal: ${data.error}`);
      }
    } catch (err) {
      setToastMessage(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 font-mono tracking-tight">
                SIMULATOR DEWAN JURI &amp; EVALUASI SISTEM
              </h2>
              <p className="text-[11px] text-slate-400">
                Uji langsung mekanisme fusi 3 sinyal, filtrasi alarm palsu, dan mitigasi bara di peta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {toastMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-600/60 text-emerald-300 flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Section 1: Preset Scenarios */}
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2.5 font-semibold">
              1. Pilih Skenario Uji Cepat Dewan Juri
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SCENARIOS.map((sc) => (
                <div
                  key={sc.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-slate-200">{sc.name}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded border ${sc.badgeColor}`}>
                        {sc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{sc.desc}</p>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => handleApplyScenario(sc.id)}
                    className="w-full mt-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700 text-[11px]"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>Terapkan Skenario Ini</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Custom Slider Injection */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-mono font-semibold text-[11px] uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>2. Uji Custom Suhu &amp; Gas pada Titik Tertentu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Pilih Node Target
                </label>
                <select
                  value={selectedNode}
                  onChange={(e) => setSelectedNode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                >
                  <optgroup label="Klaster Riau (Pulau Padang)">
                    <option value="PK-04">PK-04 (Paku Riau - Titik Bara Aktif)</option>
                    <option value="PK-05">PK-05 (Paku Riau - Status Waspada)</option>
                    <option value="PK-01">PK-01 (Paku Riau - Status Normal)</option>
                    <option value="GS-01">GS-01 (Tiang Gas CO Riau)</option>
                  </optgroup>
                  <optgroup label="Klaster Kalimantan KHG (Sebangau)">
                    <option value="PK-K03">PK-K03 (Paku Sebangau - Bara Aktif 89°C)</option>
                    <option value="PK-K02">PK-K02 (Paku Sebangau - Waspada)</option>
                    <option value="PK-K01">PK-K01 (Paku Sebangau - Normal)</option>
                    <option value="GS-K01">GS-K01 (Tiang Gas CO Sebangau)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                  <span className="text-slate-400">Target Suhu 50cm:</span>
                  <span className="text-red-400 font-bold">{targetTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="120"
                  step="1"
                  value={targetTemp}
                  onChange={(e) => setTargetTemp(Number(e.target.value))}
                  className="w-full accent-red-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-mono">
                  <span className="text-slate-400">Gas Karbon Monoksida:</span>
                  <span className="text-sky-400 font-bold">{coPpm} ppm</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={coPpm}
                  onChange={(e) => setCoPpm(Number(e.target.value))}
                  className="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer h-2"
                />
              </div>
            </div>

            <button
              disabled={loading}
              onClick={handleCustomHeat}
              className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-sky-950/40 text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Kirim Denyut Telemetri &amp; Perbarui Peta</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-between items-center text-[11px] text-slate-400 font-mono">
          <span>Peta komando langsung diperbarui saat simulasi dijalankan.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

