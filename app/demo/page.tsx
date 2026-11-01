"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Flame,
  RotateCcw,
  Send,
  AlertTriangle,
  BatteryCharging,
  Droplets,
  CheckCircle2,
  TriangleAlert,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { PeatCrossSectionSvg } from "@/components/charts/PeatCrossSectionSvg";
import { apiErrorMessage } from "@/lib/api-error";

interface Scenario {
  id: string;
  name: string;
  description: string;
  expected_outcome: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "spread_northeast",
    name: "Skenario 1: Bara Merambat Bawah Permukaan",
    description: "Suhu PK-04 melonjak ke 92°C, probe tetangga PK-05 mulai naik ke 54°C, tiang gas GS-01 mendeteksi 185 ppm CO.",
    expected_outcome: "Sistem memvalidasi fusi 3 dari 3 sinyal, status AKTIF, kalkulasi vektor arah Timur Laut, ETA 11.9 jam.",
  },
  {
    id: "false_alarm_co_only",
    name: "Skenario 2: Filtrasi Alarm Palsu Asap Genset",
    description: "Tiang gas GS-02 mendeteksi lonjakan gas CO 120 ppm akibat knalpot genset patroli, namun suhu paku tanah PK-02 dan PK-03 tetap 30°C.",
    expected_outcome: "Sistem menolak alarm karena hanya 1 dari 3 sinyal yang terpenuhi. Status tetap Normal.",
  },
  {
    id: "battery_dead",
    name: "Skenario 3: Deteksi Node Offline & Baterai Kritis",
    description: "Node PK-07 mengalami penurunan voltase baterai di bawah 3.2V dan tidak mengirimkan denyut selama lebih dari 30 menit.",
    expected_outcome: "Node ditandai OFFLINE pada peta komando. Tetangga PK-01 beralih ke mode pengawasan terisolasi.",
  },
  {
    id: "area_recovery",
    name: "Skenario 4: Pemadaman Sukses & Rantai Hari Aman",
    description: "Regu Manggala Agni melakukan injeksi nozzle 800 Liter air ke kedalaman 50 cm. Suhu turun kembali ke 32°C.",
    expected_outcome: "Alert ditandai Resolved, status kembali Normal, sistem memulai perhitungan rantai hari aman wilayah (Permen LHK).",
  },
];

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>("spread_northeast");
  const [targetTemp, setTargetTemp] = useState<number>(95);
  const [coPpm, setCoPpm] = useState<number>(210);
  const [testPhone, setTestPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultOk, setResultOk] = useState<boolean>(true);
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
        setResultOk(true);
        setResultMessage(
          `Skenario "${data.scenario}" berhasil diterapkan.` +
            (data.alert_id && !data.whatsapp_sent ? " WhatsApp tidak terkirim, periksa token dan nomor Fonnte." : "")
        );
        if (scId === "spread_northeast") {
          setCurrentT50(92.0);
        } else if (scId === "area_recovery") {
          setCurrentT50(32.0);
        }
      } else {
        setResultOk(false);
        setResultMessage(`Gagal menerapkan skenario: ${apiErrorMessage(data.error, "respons server tidak dikenal")}`);
      }
    } catch (err) {
      setResultOk(false);
      setResultMessage(`Tidak bisa menghubungi server: ${err instanceof Error ? err.message : String(err)}`);
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
        setResultOk(true);
        setResultMessage(data.message);
      } else {
        setResultOk(false);
        setResultMessage(`Gagal: ${apiErrorMessage(data.error, "respons server tidak dikenal")}`);
      }
    } catch (err) {
      setResultOk(false);
      setResultMessage(`Tidak bisa menghubungi server: ${err instanceof Error ? err.message : String(err)}`);
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
        setResultOk(true);
        setResultMessage(data.message);
      } else {
        setResultOk(false);
        setResultMessage(`Gagal mereset simulasi: ${apiErrorMessage(data.error, "respons server tidak dikenal")}`);
      }
    } catch (err) {
      setResultOk(false);
      setResultMessage(`Tidak bisa menghubungi server: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestWa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) {
      setResultOk(false);
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
        setResultOk(true);
        setResultMessage(data.message);
      } else {
        setResultOk(false);
        setResultMessage(`Gagal kirim WhatsApp: ${apiErrorMessage(data.error, "respons server tidak dikenal")}`);
      }
    } catch (err) {
      setResultOk(false);
      setResultMessage(`Tidak bisa menghubungi server: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-stone-100 selection:bg-ember selection:text-white">
      {/* Top Bar */}
      <header className="h-16 border-b border-line bg-surface px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-lg tracking-tight text-stone-50">PakuBara</span>
          </Link>
          <span className="text-stone-400 font-mono">/</span>
          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <FlaskConical className="w-4 h-4" />
            Simulator Interaktif Dewan Juri
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-raised hover:bg-line text-stone-300 border border-line-strong transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulasi</span>
          </button>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white transition-all "
          >
            <span>Buka Peta Komando</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Banner Penjelasan */}
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" />
              Pusat Eksperimen Tanpa Ketergantungan Hardware
            </h2>
            <p className="text-xs text-stone-300 max-w-3xl leading-relaxed">
              Dewan juri dapat memicu skenario ekstrem karhutla, memanaskan probe secara dinamis, menguji algoritma fusi
              2 dari 3 sinyal, serta menguji penerimaan notifikasi darurat WhatsApp langsung ke nomor pribadi Anda.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 whitespace-nowrap">
            MODE DEMO AKTIF
          </span>
        </div>

        {/* Notifikasi feedback aksi */}
        {resultMessage && (
          <div
            role={resultOk ? "status" : "alert"}
            className={`p-3.5 rounded-xl bg-raised border text-xs flex items-center gap-2.5 animate-fadeIn ${
              resultOk ? "border-emerald-700/60 text-emerald-300" : "border-red-600/60 text-red-300"
            }`}
          >
            {resultOk ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : (
              <TriangleAlert className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
            )}
            <span>{resultMessage}</span>
          </div>
        )}

        {/* 4 Kartu Skenario */}
        <div>
          <h3 className="text-sm font-semibold text-stone-50 mb-4">
            1. Pilih Skenario Uji Standar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <button
                  type="button"
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc.id)}
                  aria-pressed={isSelected}
                  disabled={loading}
                  className={`w-full text-left p-4 rounded-xl border  transition-all ${
                    isSelected
                      ? "bg-raised border-ember  "
                      : "bg-surface border-line hover:border-line-strong"
                  }`}
                >
                  <span className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-50">{sc.name}</span>
                    {isSelected && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-ember-strong text-white">
                        Aktif
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-stone-400 leading-relaxed">{sc.description}</span>
                  <span className="block mt-3 pt-2.5 border-t border-line text-xs text-amber-400/90 font-mono">
                    Hasil: {sc.expected_outcome}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kontrol Pemanasan Titik Dinamis & Penampang */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel Kontrol Suhu */}
          <div className="p-5 rounded-xl bg-surface border border-line space-y-5">
            <h3 className="text-sm font-semibold text-stone-50 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent" />
              2. Manipulasi Parameter Suhu & Gas (PK-04)
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-300">Suhu Gambut Kedalaman 50 cm:</span>
                <span className="font-mono text-base font-bold text-red-400">{targetTemp}°C</span>
              </div>
              <input
                type="range"
                min="25"
                max="150"
                step="1"
                value={targetTemp}
                onChange={(e) => setTargetTemp(Number(e.target.value))}
                className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
              />
              <div className="flex justify-between text-xs font-mono text-stone-400">
                <span>25°C (Normal)</span>
                <span>60°C (Ambang Bara)</span>
                <span>150°C (Pirolisis Berat)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-300">Konsentrasi Gas CO (GS-01):</span>
                <span className="font-mono text-base font-bold text-orange-400">{coPpm} ppm</span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="5"
                value={coPpm}
                onChange={(e) => setCoPpm(Number(e.target.value))}
                className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs font-mono text-stone-400">
                <span>0 ppm</span>
                <span>50 ppm (Ambang Gas)</span>
                <span>400 ppm (Kritis)</span>
              </div>
            </div>

            <button
              onClick={handleHeatNode}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white text-xs font-semibold tracking-wide transition-all  flex items-center justify-center gap-2"
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
        <div className="p-5 rounded-xl bg-surface border border-line">
          <h3 className="text-sm font-semibold text-stone-50 flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-emerald-400" />
            3. Uji Pengiriman Pesan WhatsApp Resmi (Fonnte API)
          </h3>
          <p className="text-xs text-stone-400 mb-4 max-w-2xl leading-relaxed">
            Ketik nomor WhatsApp aktif Anda (format: 62812xxxxxxxx) untuk menerima format pesan 8 baris darurat
            yang akan diterima oleh regu pemadam Manggala Agni di lapangan.
          </p>

          <form onSubmit={handleSendTestWa} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              placeholder="Contoh: 628123456789"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="flex-1 bg-ink border border-line rounded-lg px-3.5 py-2 text-xs font-mono text-stone-50 focus:outline-none focus:border-ember"
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

