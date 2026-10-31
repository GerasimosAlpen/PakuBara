"use client";

import React from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TrendingUp, Droplets, Radio, Battery } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          breadcrumb="ANALITIK & REGULASI / ANALITIK EFISIENSI"
          pageTitle="Analitik Efisiensi Penanggulangan & Keandalan Jaringan LoRaWAN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Uptime Jaringan</span>
                <Radio className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1.5">
                99.4%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Paket hilang: 0.6% (LoRa SF10)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Penghematan Air</span>
                <Droplets className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-sky-600 mt-1.5">
                55%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                120L/titik vs siram permukaan konvensional
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Waktu Kirim Alert WA</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-700 mt-1.5">
                1.8 Detik
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Target SLA &lt; 60 Detik ke Regu MPA
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Daya Baterai Rata-rata</span>
                <Battery className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1.5">
                3.88 V
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Proyeksi masa pakai: 19 bulan
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Studi Komparasi Pemadaman: Injeksi Peat Nozzle vs Siram Permukaan
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex justify-between font-extrabold text-slate-900 mb-1">
                    <span>Metode PakuBara (Injeksi Peat Nozzle Kedalaman 50 cm)</span>
                    <span className="text-emerald-700 font-mono">120 Liter / titik</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Air dialirkan langsung ke zona pirolisis tengah (50 cm). Memutus reaksi oksidasi
                    bawah tanah secara presisi dengan penghematan air 52-55%.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
                  <div className="flex justify-between font-extrabold text-slate-900 mb-1">
                    <span>Metode Konvensional (Siram Permukaan / Water Bombing)</span>
                    <span className="text-red-600 font-mono">&gt;260 Liter / titik</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Air tertahan di lapisan serasah hidrofobik atas (20 cm, 34°C) tanpa menembus
                    inti bara 542°C di kedalaman 50 cm, sehingga api sering menyala kembali.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Metrik Keandalan Jaringan LoRaWAN &amp; Fusi Sinyal
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-slate-600">Total Paket Telemetri 24 Jam:</span>
                  <span className="font-mono font-extrabold text-slate-900">2.880 Paket</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-slate-600">Rata-rata RSSI Penerimaan Posko KHG Riau:</span>
                  <span className="font-mono font-extrabold text-emerald-700">
                    -82 dBm (Sangat Baik)
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                  <span className="text-slate-600">Rasio Signal-to-Noise (SNR):</span>
                  <span className="font-mono font-extrabold text-slate-900">+7.5 dB</span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-slate-600">Filtrasi Alarm Palsu (Fusi 2-dari-3 Sinyal):</span>
                  <span className="font-mono font-extrabold text-sky-700">
                    100% Tervalidasi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
