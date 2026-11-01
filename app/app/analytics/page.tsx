"use client";

import React from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  BarChart3,
  TrendingUp,
  Droplets,
  Radio,
  Battery,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-ink text-stone-100 flex flex-col select-none">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="border-b border-line pb-4">
            <h1 className="text-xl font-bold font-mono text-stone-50 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              ANALITIK & EFISIENSI PENANGGULANGAN
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Metrik performa jaringan LoRa 433 MHz, efisiensi konsumsi air suntik gambut, dan tren anomali suhu.
            </p>
          </div>

          {/* 4 Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">Uptime Jaringan</span>
                <Radio className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">99.4%</div>
              <div className="text-xs text-stone-400 mt-0.5">Paket hilang: 0.6% (LoRa SF10)</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">Penghematan Air</span>
                <Droplets className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-orange-400 mt-1">82%</div>
              <div className="text-xs text-stone-400 mt-0.5">Dibandingkan water bombing udara</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">Rata-rata Respon</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">18 Menit</div>
              <div className="text-xs text-stone-400 mt-0.5">Dari deteksi hingga regu tiba</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-line">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">Daya Baterai Rata-rata</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-stone-50 mt-1">3.88 V</div>
              <div className="text-xs text-stone-400 mt-0.5">Proyeksi sisa daya: 19 bulan</div>
            </div>
          </div>

          {/* Analisis Efisiensi Pemadaman Gambut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-surface border border-line space-y-4">
              <h3 className="text-sm font-semibold text-stone-50">
                Studi Komparasi Pemadaman: Injeksi Nozzle vs Helikopter
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-ink border border-line">
                  <div className="flex justify-between font-bold text-stone-50 mb-1">
                    <span>Metode PakuBara (Injeksi Nozzle Gambut Kedalaman 50cm)</span>
                    <span className="text-emerald-400 font-mono">Rp 4.500.000 / titik</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Air dialirkan langsung ke inti bara pirolisis. Membutuhkan rata-rata 600 - 800 Liter air
                    dengan keberhasilan padam 100% tanpa rekurensi bara.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-ink border border-line">
                  <div className="flex justify-between font-bold text-stone-50 mb-1">
                    <span>Metode Konvensional (Water Bombing Helikopter)</span>
                    <span className="text-red-400 font-mono">Rp 120.000.000 / sortie</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Air menguap di kanopi pohon sebelum mencapai lapisan gambut dalam. Rawan menyala kembali
                    dalam 24 - 48 jam jika tertiup angin kencang.
                  </p>
                </div>
              </div>
            </div>

            {/* Statistik Integritas Sinyal & Hardware */}
            <div className="p-5 rounded-xl bg-surface border border-line space-y-4">
              <h3 className="text-sm font-semibold text-stone-50">
                Metrik Keandalan Jaringan LoRa 433 MHz
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-line">
                  <span className="text-stone-400">Total Paket Telemetri 24 Jam:</span>
                  <span className="font-mono font-bold text-stone-50">2.880 Paket</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-line">
                  <span className="text-stone-400">Rata-rata RSSI Penerimaan Posko:</span>
                  <span className="font-mono font-bold text-orange-400">-82.4 dBm (Sangat Baik)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-line">
                  <span className="text-stone-400">Rasio Signal-to-Noise (SNR):</span>
                  <span className="font-mono font-bold text-emerald-400">+7.8 dB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-line">
                  <span className="text-stone-400">Tingkat Penolakan Alarm Palsu CO:</span>
                  <span className="font-mono font-bold text-amber-400">100% (2 Insiden Gas Tersaring)</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

