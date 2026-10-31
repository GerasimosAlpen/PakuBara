"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Flame, ShieldCheck, AlertTriangle, Wind, Droplets, Phone, MapPin, CheckCircle } from "lucide-react";

interface AreaSummaryData {
  area: {
    id: string;
    name: string;
    slug: string;
    risk_level: string;
    safe_days_streak: number;
  };
  nodes_total: number;
  status_breakdown: {
    normal: number;
    watch: number;
    warning: number;
    active: number;
    offline: number;
  };
  open_alerts_count: number;
  avg_temp_50cm: number;
  max_co_ppm: number;
  is_safe: boolean;
  safe_streak_progress: {
    current_days: number;
    target_days: number;
    percentage: number;
    status_text: string;
  };
}

function AreaPublicStatusContent() {
  const params = useParams();
  const slug = (params?.areaSlug as string) || "blok-b-pulau-padang";

  const [data, setData] = useState<AreaSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAreaSummary() {
      try {
        const res = await fetch(`/api/areas/${slug}/summary`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat status area publik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAreaSummary();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121010] flex items-center justify-center text-neutral-400 text-xs font-mono">
        Memuat status kesiapsiagaan gambut desa...
      </div>
    );
  }

  const isBaraActive = data ? data.status_breakdown.active > 0 : true;

  return (
    <div className="min-h-screen bg-[#121010] text-[#F3F4F6] selection:bg-[#EA580C] selection:text-white pb-12">
      {/* Top Header */}
      <header className="border-b border-[#2D2424] bg-[#181414] py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EA580C] to-[#DC2626] flex items-center justify-center">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="font-mono font-bold text-sm text-white">PAKUBARA DESA</div>
            <div className="text-[10px] text-neutral-400">Portal Informasi Siaga Gambut Warga & MPA</div>
          </div>
        </div>

        <Link
          href="/login"
          className="text-xs px-3 py-1.5 rounded-lg bg-[#2D2424] hover:bg-[#3D3030] text-neutral-300 transition-colors"
        >
          Masuk Akun Petugas
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* Status Badge Banner */}
        <div
          className={`p-6 rounded-2xl border ${
            isBaraActive
              ? "bg-gradient-to-br from-red-950/60 via-[#1F1414] to-[#181414] border-red-700/60"
              : "bg-gradient-to-br from-emerald-950/60 via-[#141F18] to-[#181414] border-emerald-700/60"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
              Wilayah Pantau Gambut
            </span>
            <span
              className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                isBaraActive ? "bg-red-600 text-white animate-pulse" : "bg-emerald-600 text-white"
              }`}
            >
              {isBaraActive ? "Siaga Bara Aktif" : "Kondisi Aman Terkendali"}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-white">{data?.area.name || "Blok B Hutan Gambut Lindung"}</h1>
          <p className="text-xs text-neutral-300 mt-1">
            Kabupaten Kepulauan Meranti, Riau (Pemeriksaan berkala tiap 5 menit via LoRa 433 MHz)
          </p>

          {/* Rantai Hari Aman Permen LHK */}
          <div className="mt-5 p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-300">Rantai Hari Aman (Standar Permen LHK P.32/2016):</span>
              <span className="font-mono font-bold text-amber-400">
                {data?.safe_streak_progress.status_text || "1 dari 3 hari stabil"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${data?.safe_streak_progress.percentage || 33}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400">
              Kawasan membutuhkan 3 hari berturut-turut tanpa anomali bara suhu 50 cm sebelum dinyatakan bebas risiko.
            </p>
          </div>
        </div>

        {/* Status Sensor Ringkas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#181414] border border-[#2D2424]">
            <div className="text-[10px] text-neutral-400">Titik Sensor Aktif</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">{data?.nodes_total || 10} Unit</div>
            <div className="text-[10px] text-emerald-400 mt-1">LoRa Posko Online</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181414] border border-[#2D2424]">
            <div className="text-[10px] text-neutral-400">Pusat Bara Terdeteksi</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-0.5">
              {data?.status_breakdown.active || 1} Titik
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">PK-04 Kedalaman 50cm</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181414] border border-[#2D2424]">
            <div className="text-[10px] text-neutral-400">Suhu Rata-rata 50cm</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              {data?.avg_temp_50cm || 37.8}°C
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">Normal: 28-32°C</div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#181414] border border-[#2D2424]">
            <div className="text-[10px] text-neutral-400">Arah & Kecepatan Angin</div>
            <div className="text-xl font-bold font-mono text-sky-400 mt-0.5">14 km/j</div>
            <div className="text-[10px] text-neutral-400 mt-1">Menuju Barat Daya</div>
          </div>
        </div>

        {/* Panduan Kesiapsiagaan Warga */}
        <div className="p-5 rounded-xl bg-[#181414] border border-[#2D2424] space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Panduan Keselamatan Masyarakat Sekitar Hutan
          </h3>

          <div className="space-y-2 text-xs text-neutral-300">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#121010]">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>
                <strong>Dilarang keras membersihkan lahan dengan api:</strong> Dalam status siaga, bara bawah permukaan
                dapat menyala dan merambat puluhan meter per hari tanpa terlihat asap tebal.
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#121010]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>
                <strong>Pertahankan sekat kanal (Canal Blocking):</strong> Pastikan pintu air kanal tertutup agar tinggi
                muka air gambut tetap di atas ambang kritis minus 40 cm.
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-[#121010]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              <span>
                <strong>Hubungi satgas bila mencium bau arang menyengat:</strong> Bau arang gambut tanpa api di permukaan
                menandakan pembaraan pirolisis di kedalaman tanah.
              </span>
            </div>
          </div>

          {/* Hotline Darurat */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#261E1E]">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Posko Satgas Manggala Agni Daops Siak:</span>
              <strong className="text-white font-mono">+62 812-3456-7890</strong>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">Siaga 24 Jam Bebas Pulsa</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AreaPublicStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#121010] flex items-center justify-center text-xs font-mono text-neutral-400">
          Memuat status kesiapsiagaan gambut desa...
        </div>
      }
    >
      <AreaPublicStatusContent />
    </Suspense>
  );
}

