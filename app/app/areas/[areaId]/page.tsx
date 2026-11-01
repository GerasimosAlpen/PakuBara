"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AreaStatusDonut } from "@/components/charts/AreaStatusDonut";
import {
  Layers,
  ShieldCheck,
  FileDown,
  Phone,
  Radio,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

interface AreaSummary {
  area: {
    id: string;
    name: string;
    slug: string;
    risk_level: string;
    safe_days_streak: number;
    phone_recipients: string[];
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

function AreaDetailContent() {
  const params = useParams();
  const areaId = (params?.areaId as string) || "a0000000-0000-0000-0000-000000000001";

  const [summary, setSummary] = useState<AreaSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadArea() {
      try {
        const res = await fetch(`/api/areas/${areaId}/summary`);
        const json = await res.json();
        if (json.success && json.data) {
          setSummary(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat detail area:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArea();
  }, [areaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-stone-100 flex flex-col">
        <AppNavbar />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-stone-400">
            Memuat ringkasan wilayah pantau...
          </div>
        </div>
      </div>
    );
  }

  const area = summary?.area;
  const streak = summary?.safe_streak_progress;

  return (
    <div className="min-h-screen bg-ink text-stone-100 flex flex-col select-none">
      <AppNavbar activeAreaName={area?.name} />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header & PDF Download Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded bg-line text-stone-300">
                  Profil Wilayah Konsesi
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                  Tingkat Risiko: {area?.risk_level.toUpperCase()}
                </span>
              </div>
              <h1 className="text-xl font-bold font-mono text-stone-50 flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                {area?.name}
              </h1>
              <p className="text-xs text-stone-400">
                Kabupaten Kepulauan Meranti, Riau (Luas Grid: 4.2 km² gambut dalam)
              </p>
            </div>

            <a
              href={`/api/reports/areas/${area?.id}/pdf`}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white text-xs font-semibold  transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Cetak Laporan Audit PDF (Permen LHK)</span>
            </a>
          </div>

          {/* Rantai Hari Aman Permen LHK P.32/2016 Card */}
          <div className="p-5 rounded-xl bg-surface border border-line space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-stone-50">
                  Kepatuhan Standar Pemantauan Permen LHK P.32/2016
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                {streak?.status_text}
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-ink border border-line overflow-hidden">
              <div
                className="h-full bg-ok rounded-full transition-all duration-500"
                style={{ width: `${streak?.percentage}%` }}
              />
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              Berdasarkan regulasi Kementerian LHK, suatu blok gambut hanya dapat diturunkan status siaganya
              apabila tidak ada titik panas atau bara pirolisis aktif selama 3 hari berturut-turut.
            </p>
          </div>

          {/* 2-Column: Sebaran Status Titik & Parameter Wilayah */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AreaStatusDonut statusBreakdown={summary?.status_breakdown} />

            <div className="p-5 rounded-xl bg-surface border border-line space-y-4">
              <h3 className="text-sm font-semibold text-stone-50">
                Ringkasan Metrik Kawasan
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-ink border border-line">
                  <span className="text-xs text-stone-400 block">
                    Jumlah Titik Pantau
                  </span>
                  <span className="text-xl font-black font-mono text-stone-50 mt-1 block">
                    {summary?.nodes_total} Unit
                  </span>
                  <span className="text-xs text-stone-400">8 Paku Suhu + 2 Tiang Gas</span>
                </div>

                <div className="p-3 rounded-lg bg-ink border border-line">
                  <span className="text-xs text-stone-400 block">
                    Alert Aktif Saat Ini
                  </span>
                  <span className="text-xl font-black font-mono text-red-500 mt-1 block">
                    {summary?.open_alerts_count} Insiden
                  </span>
                  <span className="text-xs text-red-400">PK-04 Kedalaman 50cm</span>
                </div>

                <div className="p-3 rounded-lg bg-ink border border-line">
                  <span className="text-xs text-stone-400 block">
                    Rata-rata Suhu 50cm
                  </span>
                  <span className="text-xl font-black font-mono text-amber-400 mt-1 block">
                    {summary?.avg_temp_50cm}°C
                  </span>
                  <span className="text-xs text-stone-400">Batas normal &lt; 32°C</span>
                </div>

                <div className="p-3 rounded-lg bg-ink border border-line">
                  <span className="text-xs text-stone-400 block">
                    Konsentrasi CO Tertinggi
                  </span>
                  <span className="text-xl font-black font-mono text-orange-400 mt-1 block">
                    {summary?.max_co_ppm} ppm
                  </span>
                  <span className="text-xs text-orange-400">Tiang Gas GS-01</span>
                </div>
              </div>

              {/* Kontak Penerima WhatsApp */}
              <div className="p-3 rounded-lg bg-ink border border-line space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-300 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Daftar Nomor WhatsApp Alert Area Ini:</span>
                </div>
                <div className="text-xs font-mono text-stone-400">
                  {area?.phone_recipients.join(", ") || "+62 812-3456-7890 (Regu Cepat Siak)"}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AreaDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono text-stone-400">
          Memuat ringkasan wilayah pantau...
        </div>
      }
    >
      <AreaDetailContent />
    </Suspense>
  );
}

