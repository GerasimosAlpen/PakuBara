"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  RotateCcw,
  Send,
  CheckCircle2,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { PeatCrossSectionSvg } from "@/components/charts/PeatCrossSectionSvg";
import { PakuBaraLogo } from "@/components/layout/AppSidebar";

interface Scenario {
  id: string;
  name: string;
  description: string;
  expected_outcome: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "bara_merambat",
    name: "Skenario 1: Bara Merambat Bawah Permukaan (PK-04)",
    description:
      "Suhu PK-04 melonjak ke 542°C di kedalaman 50 cm, permukaan tetap dingin (34°C), dan tiang CO-02 mendeteksi 185 ppm CO.",
    expected_outcome:
      "Sistem memvalidasi fusi 3 dari 3 sinyal, status BARA AKTIF, prediksi kecepatan rambat 4,2 cm/jam ke arah Timur Laut.",
  },
  {
    id: "alarm_palsu_co",
    name: "Skenario 2: Filtrasi Alarm Palsu Asap Genset",
    description:
      "Tiang gas GS-02 mendeteksi lonjakan gas CO 120 ppm akibat knalpot genset patroli, namun suhu paku tanah PK-02 dan PK-03 tetap 30°C.",
    expected_outcome:
      "Sistem menolak alarm karena hanya 1 dari 3 sinyal yang terpenuhi. Status tetap Aman.",
  },
  {
    id: "paku_mati_baterai",
    name: "Skenario 3: Deteksi Node Offline & Baterai Kritis",
    description:
      "Node PK-07 mengalami penurunan voltase baterai di bawah 3.2V dan tidak mengirimkan denyut selama lebih dari 30 menit.",
    expected_outcome:
      "Node ditandai OFFLINE pada peta komando. Tetangga PK-01 beralih ke mode pengawasan terisolasi.",
  },
  {
    id: "pemulihan_area",
    name: "Skenario 4: Pemadaman Peat Nozzle Sukses & Verifikasi 72 Jam",
    description:
      "Regu Manggala Agni melakukan injeksi Peat Nozzle 120 Liter air ke kedalaman 50 cm. Suhu turun kembali ke 32°C.",
    expected_outcome:
      "Alert ditandai Resolved, status beralih ke Protokol Verifikasi Lahan 72 Jam (Permen LHK P.32/2016).",
  },
];

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>("bara_merambat");
  const [targetTemp, setTargetTemp] = useState<number>(542);
  const [coPpm, setCoPpm] = useState<number>(185);
  const [testPhone, setTestPhone] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [currentT50, setCurrentT50] = useState<number>(542);

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
        setResultMessage(`Skenario "${data.scenario.name}" berhasil diterapkan.`);
        if (scId === "bara_merambat") {
          setCurrentT50(542);
        } else if (scId === "pemulihan_area") {
          setCurrentT50(32);
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
        setCurrentT50(542);
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
      setResultMessage("Nomor WhatsApp wajib diisi (contoh: 628123456789)");
      return;
    }
    setLoading(true);
    setResultMessage(null);
    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: testPhone, target_phone: testPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setResultMessage(`✓ Notifikasi WhatsApp terkirim ke ${testPhone}! Detail: ${data.provider_response?.detail || "Terkirim"}`);
      } else {
        setResultMessage(`Gagal kirim WhatsApp: ${data.error || JSON.stringify(data.provider_response)}`);
      }
    } catch (err) {
      setResultMessage(`Error: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 select-none">
      {/* Top Bar */}
      <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <PakuBaraLogo className="w-8 h-8" />
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-[#0284C7]">Paku</span>
              <span className="text-[#EA580C]">Bara</span>
            </span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Simulator Interaktif Dewan Juri
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulasi</span>
          </button>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white transition-colors shadow-xs"
          >
            <span>Buka Peta Komando</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-base font-extrabold text-slate-900">
              Pusat Eksperimen Telemetri Subsurface Tanpa Ketergantungan Hardware Fisik
            </h1>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              Dewan juri dapat memicu skenario pembaraan bawah tanah, mengatur suhu zona pirolisis 50 cm,
              menguji fusi 2 dari 3 sinyal, dan mengirim pesan peringatan dini WhatsApp langsung ke ponsel.
            </p>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            MODE SIMULASI JURI AKTIF
          </span>
        </div>

        {resultMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}

        {/* 4 Skenario */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
            1. Pilih Skenario Uji Standar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCENARIOS.map((sc) => {
              const isSelected = selectedScenario === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-[#0D2B1D] ring-2 ring-[#0D2B1D]/10 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-slate-900">{sc.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0D2B1D] text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{sc.description}</p>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-emerald-800 font-medium">
                    Hasil: {sc.expected_outcome}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sliders & Cross Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>2. Manipulasi Parameter Suhu &amp; Gas (Node PK-04)</span>
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">
                  Suhu Gambut Kedalaman 50 cm (Zona Pirolisis):
                </span>
                <span className="font-mono text-base font-extrabold text-red-600">
                  {targetTemp}°C
                </span>
              </div>
              <input
                type="range"
                min="28"
                max="600"
                step="2"
                value={targetTemp}
                onChange={(e) => setTargetTemp(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>28°C (Normal)</span>
                <span>100°C (Pengeringan)</span>
                <span>542°C (Bara Pirolisis)</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">
                  Konsentrasi Gas CO (Tiang CO-02):
                </span>
                <span className="font-mono text-base font-extrabold text-amber-700">
                  {coPpm} ppm
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={coPpm}
                onChange={(e) => setCoPpm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>10 ppm (Normal)</span>
                <span>100 ppm (Ambang Smouldering)</span>
                <span>300 ppm (Kritis)</span>
              </div>
            </div>

            <button
              onClick={handleHeatNode}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Terapkan Parameter ke Node PK-04 Sekarang</span>
            </button>
          </div>

          <div>
            <PeatCrossSectionSvg
              t20={34}
              t50={currentT50}
              t100={68}
              waterTableCm={-55}
              highlightDepth={50}
              interactive={false}
            />
          </div>
        </div>

        {/* WhatsApp Test */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-700" />
            <span>3. Uji Pengiriman Pesan WhatsApp Resmi (Fonnte API)</span>
          </h3>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Ketik nomor WhatsApp aktif Anda (format: 62812xxxxxxxx) untuk menerima format peringatan dini
            bara gambut beserta koordinat GPS dan panduan injeksi Peat Nozzle 120 Liter.
          </p>

          <form onSubmit={handleSendTestWa} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              placeholder="Contoh: 628123456789"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-700"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-emerald-300" />
              <span>Kirim Alert Uji</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
