"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Flame,
  RotateCcw,
  Send,
  AlertTriangle,
  BatteryCharging,
  Droplets,
  CheckCircle2,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { PeatCrossSectionSvg } from "@/components/charts/PeatCrossSectionSvg";

interface Scenario {
  id: string;
  name: string;
  description: string;
  expected_outcome: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "bara_merambat",
    name: "Skenario 1: Bara Merambat Bawah Permukaan",
    description: "Suhu PK-04 melonjak ke 92°C, probe tetangga PK-05 mulai naik ke 54°C, tiang gas GS-01 mendeteksi 185 ppm CO.",
    expected_outcome: "Sistem memvalidasi fusi 3 dari 3 sinyal, status AKTIF, kalkulasi vektor arah Timur Laut, ETA 11.9 jam.",
  },
  {
    id: "alarm_palsu_co",
    name: "Skenario 2: Filtrasi Alarm Palsu Asap Genset",
    description: "Tiang gas GS-02 mendeteksi lonjakan gas CO 120 ppm akibat knalpot genset patroli, namun suhu paku tanah PK-02 dan PK-03 tetap 30°C.",
    expected_outcome: "Sistem menolak alarm karena hanya 1 dari 3 sinyal yang terpenuhi. Status tetap Normal.",
  },
  {
    id: "paku_mati_baterai",
    name: "Skenario 3: Deteksi Node Offline & Baterai Kritis",
    description: "Node PK-07 mengalami penurunan voltase baterai di bawah 3.2V dan tidak mengirimkan denyut selama lebih dari 30 menit.",
    expected_outcome: "Node ditandai OFFLINE pada peta komando. Tetangga PK-01 beralih ke mode pengawasan terisolasi.",
  },
  {
    id: "pemulihan_area",
    name: "Skenario 4: Pemadaman Sukses & Rantai Hari Aman",
    description: "Regu Manggala Agni melakukan injeksi nozzle 800 Liter air ke kedalaman 50 cm. Suhu turun kembali ke 32°C.",
    expected_outcome: "Alert ditandai Resolved, status kembali Normal, sistem memulai perhitungan rantai hari aman wilayah (Permen LHK).",
  },
];

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>("bara_merambat");
  const [targetTemp, setTargetTemp] = useState<number>(95);
  const [coPpm, setCoPpm] = useState<number>(210);
  const [testPhone, setTestPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [currentT50, setCurrentT50] = useState<number>(87.3);

  const handleApplyScenario = async (scId: string) => {
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await fetch("/api/demo/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scId }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedScenario(scId);
        setResultMessage(`Skenario "${data.scenario.name}" berhasil diterapkan!`);
        if (scId === "bara_merambat") {
          setCurrentT50(92.0);
        } else if (scId === "pemulihan_area") {
          setCurrentT50(32.0);
        }
      } else {
        setResultMessage(`Gagal menerapkan skenario: ${data.error}`);
      }
    } catch (err) {
      setResultMessage(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHeatNode = async () => {
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await fetch("/api/demo/heat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: "PK-04",
          target_temp: targetTemp,
          co_ppm: coPpm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentT50(targetTemp);
        setResultMessage(data.message);
      } else {
        setResultMessage(`Gagal: ${data.error}`);
      }
    } catch (err) {
      setResultMessage(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setCurrentT50(87.3);
        setResultMessage(data.message);
      }
    } catch (err) {
      setResultMessage(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestWa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) {
      setResultMessage("Nomor WhatsApp wajib diisi (misal: 628123456789)");
      return;
    }
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_phone: testPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage(data.message);
      } else {
        setResultMessage(`Gagal kirim WhatsApp: ${data.error}`);
      }
    } catch (err) {
      setResultMessage(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121010] text-[#F3F4F6] selection:bg-[#EA580C] selection:text-white">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#2D2424] bg-[#181414] px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EA580C] to-[#DC2626] flex items-center justify-center shadow-lg">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-mono font-bold text-base tracking-wider text-white">PAKUBARA</span>
          </Link>
          <span className="text-neutral-500 font-mono">/</span>
          <span className="text-xs font-semibold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Simulator Interaktif Dewan Juri
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[#241D1D] hover:bg-[#2D2424] text-neutral-300 border border-[#382B2B] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulasi</span>
          </button>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#EA580C] hover:bg-[#F97316] text-white transition-all shadow-md"
          >
            <span>Buka Peta Komando</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Banner Penjelasan */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#1C1616] to-[#1C1616] border border-amber-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Pusat Eksperimen Tanpa Ketergantungan Hardware
            </h2>
            <p className="text-xs text-neutral-300 max-w-3xl leading-relaxed">
              Dewan juri dapat memicu skenario ekstrem karhutla, memanaskan probe secara dinamis, menguji algoritma fusi
              2 dari 3 sinyal, serta menguji penerimaan notifikasi darurat WhatsApp langsung ke nomor pribadi Anda.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 whitespace-nowrap">
            MODE DEMO AKTIF
          </span>
        </div>

        {/* Notifikasi feedback aksi */}
        {resultMessage && (
          <div className="p-3.5 rounded-xl bg-[#1C1616] border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}

        {/* 4 Kartu Skenario */}
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono mb-4">
            1. Pilih Skenario Uji Standar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#221818] border-[#EA580C] shadow-lg shadow-orange-950/30"
                      : "bg-[#181414] border-[#2D2424] hover:border-[#3D3030]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{sc.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EA580C] text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{sc.description}</p>
                  <div className="mt-3 pt-2.5 border-t border-[#261E1E] text-[11px] text-amber-400/90 font-mono">
                    Hasil: {sc.expected_outcome}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kontrol Pemanasan Titik Dinamis & Penampang */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Kontrol Suhu */}
          <div className="p-5 rounded-xl bg-[#181414] border border-[#2D2424] space-y-5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#EA580C]" />
              2. Manipulasi Parameter Suhu & Gas (PK-04)
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300">Suhu Gambut Kedalaman 50 cm:</span>
                <span className="font-mono text-base font-bold text-red-400">{targetTemp}°C</span>
              </div>
              <input
                type="range"
                min="25"
                max="150"
                step="1"
                value={targetTemp}
                onChange={(e) => setTargetTemp(Number(e.target.value))}
                className="w-full h-2 bg-[#2D2424] rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>25°C (Normal)</span>
                <span>60°C (Ambang Bara)</span>
                <span>150°C (Pirolisis Berat)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300">Konsentrasi Gas CO (GS-01):</span>
                <span className="font-mono text-base font-bold text-sky-400">{coPpm} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="5"
                value={coPpm}
                onChange={(e) => setCoPpm(Number(e.target.value))}
                className="w-full h-2 bg-[#2D2424] rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                <span>0 ppm</span>
                <span>50 ppm (Ambang Gas)</span>
                <span>400 ppm (Kritis)</span>
              </div>
            </div>

            <button
              onClick={handleHeatNode}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#EA580C] hover:bg-[#F97316] text-white text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>Terapkan Panas ke Node PK-04 Sekarang</span>
            </button>
          </div>

          {/* Penampang Gambut Real-time */}
          <div>
            <PeatCrossSectionSvg
              t20={36.4}
              t50={currentT50}
              t100={42.0}
              waterTableCm={-55}
              highlightDepth={50}
              interactive={false}
            />
          </div>
        </div>

        {/* Uji Notifikasi WhatsApp ke Nomor Juri */}
        <div className="p-5 rounded-xl bg-[#181414] border border-[#2D2424]">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-emerald-400" />
            3. Uji Pengiriman Pesan WhatsApp Resmi (Fonnte API)
          </h3>
          <p className="text-xs text-neutral-400 mb-4 max-w-2xl leading-relaxed">
            Ketik nomor WhatsApp aktif Anda (format: 62812xxxxxxxx) untuk menerima format pesan 8 baris darurat
            yang akan diterima oleh regu pemadam Manggala Agni di lapangan.
          </p>

          <form onSubmit={handleSendTestWa} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              placeholder="Contoh: 628123456789"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="flex-1 bg-[#121010] border border-[#2D2424] rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#EA580C]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Alert Uji</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

