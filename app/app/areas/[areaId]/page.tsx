"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AreaStatusDonut } from "@/components/charts/AreaStatusDonut";
import { ShieldCheck, FileDown, Phone } from "lucide-react";

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

  const area = summary?.area;
  const streak = summary?.safe_streak_progress;

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          activeAreaName={area?.name}
          breadcrumb="PUSAT OPERASI / DETAIL KAWASAN GAMBUT"
          pageTitle={area?.name || "Blok B Pulau Padang (Riau)"}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs font-mono text-slate-500">
              Memuat ringkasan wilayah pantau...
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-600">
                  Kabupaten Kepulauan Meranti, Riau · Pemantauan kepatuhan Permen LHK No. P.32/2016
                </p>

                <a
                  href={`/api/reports/areas/${area?.id}/pdf`}
                  download
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <FileDown className="w-4 h-4 text-emerald-300" />
                  <span>Cetak Laporan Audit PDF (Permen LHK)</span>
                </a>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Protokol Verifikasi Lahan Aman 72 Jam (Permen LHK P.32/2016)
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    {streak?.status_text}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${streak?.percentage ?? 33}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Berdasarkan regulasi Kementerian LHK, suatu sektor gambut hanya dapat dinyatakan aman ditinggalkan apabila suhu bawah tanah &lt;35°C dan CO &lt;10 ppm stabil selama 72 jam berturut-turut.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AreaStatusDonut statusBreakdown={summary?.status_breakdown} />

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Ringkasan Metrik Kawasan
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Jumlah Titik Pantau
                      </span>
                      <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
                        {summary?.nodes_total} Unit
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200">
                      <span className="text-[11px] text-red-700 font-medium block">
                        Alert Aktif Saat Ini
                      </span>
                      <span className="text-xl font-extrabold font-mono text-red-600 mt-1 block">
                        {summary?.open_alerts_count} Insiden
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Rata-rata Suhu 50cm
                      </span>
                      <span className="text-xl font-extrabold font-mono text-amber-700 mt-1 block">
                        {summary?.avg_temp_50cm}°C
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Konsentrasi CO Tertinggi
                      </span>
                      <span className="text-xl font-extrabold font-mono text-sky-700 mt-1 block">
                        {summary?.max_co_ppm} ppm
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Daftar Nomor WhatsApp Alert Area Ini:</span>
                    </div>
                    <div className="text-xs font-mono text-slate-600">
                      {area?.phone_recipients.join(", ") || "+62 812-3456-7890 (Regu Manggala Agni)"}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AreaDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center text-xs font-mono text-slate-500">
          Memuat ringkasan wilayah pantau...
        </div>
      }
    >
      <AreaDetailContent />
    </Suspense>
  );
}
