"use client";

import React from "react";
import Link from "next/link";
import { Flame, Compass, Radio, Bell, ArrowRight, ShieldCheck, Sparkles, MapPin, Database } from "lucide-react";
import { PeatCrossSectionSvg } from "@/components/charts/PeatCrossSectionSvg";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121010] text-[#F3F4F6] selection:bg-[#EA580C] selection:text-white">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-[#2D2424] bg-[#121010]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EA580C] to-[#DC2626] flex items-center justify-center shadow-lg shadow-orange-950/40">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-mono font-bold text-lg tracking-wider text-white">PAKUBARA</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulator Juri</span>
          </Link>
          <Link
            href="/app"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#EA580C] hover:bg-[#F97316] text-white transition-all shadow-md shadow-orange-950/30"
          >
            Masuk Posko Komando
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#EA580C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#241717] border border-[#442828] text-[#EA580C] text-xs font-mono font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
          Sistem Deteksi Dini Karhutla Bawah Permukaan
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Mendeteksi Bara Gambut <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EF4444]">
            Sebelum Menjadi Lidah Api
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
          Kebakaran lahan gambut berawal dari pembaraan pirolisis di kedalaman 20 hingga 60 cm tanpa lidah api kasatmata.
          PakuBara menancapkan probe termal LoRa dan tiang gas CO untuk menemukan bara berhari-hari sebelum satelit optik melihat asap.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/app"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EA580C] hover:bg-[#F97316] text-white font-medium text-sm transition-all shadow-lg shadow-orange-950/50 hover:scale-105"
          >
            <span>Buka Peta Komando Lapangan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/demo"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1616] hover:bg-[#261E1E] border border-[#382B2B] text-neutral-200 font-medium text-sm transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Coba Simulator Interaktif Juri</span>
          </Link>
        </div>
      </section>

      {/* 4 Strip Angka Masalah Nasional 2026 */}
      <section className="border-y border-[#2D2424] bg-[#161212] py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl bg-[#1C1616] border border-[#2D2424]">
            <div className="text-3xl font-extrabold text-[#EA580C] font-mono">95%</div>
            <div className="text-xs font-semibold text-white mt-1">Bara di Bawah Permukaan</div>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Terjadi pada zona pirolisis 20 hingga 60 cm tanpa kobaran api kasatmata di permukaan tanah.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1616] border border-[#2D2424]">
            <div className="text-3xl font-extrabold text-amber-400 font-mono">24 Jam</div>
            <div className="text-xs font-semibold text-white mt-1">Keterlambatan Satelit Optik</div>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Satelit tertahan kanopi pohon rapat dan kabut tebal hingga bara sudah meluas ratusan meter.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1616] border border-[#2D2424]">
            <div className="text-3xl font-extrabold text-red-400 font-mono">80%</div>
            <div className="text-xs font-semibold text-white mt-1">Boros Biaya Water-Bombing</div>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Air helikopter hanya membasahi daun atas, sedangkan bara gambut di dalam tetap merambat bebas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1616] border border-[#2D2424]">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">2 dari 3</div>
            <div className="text-xs font-semibold text-white mt-1">Validasi Fusi Multi-Sinyal</div>
            <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
              Kombinasi laju pemanasan probe, korelasi paku tetangga, dan sensor CO memangkas alarm palsu.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Peat Cross Section Profile */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Bagaimana Paku Menembus Zona Bara Pirolisis
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl mx-auto">
            Gambut memiliki konduktivitas termal rendah. Panas terjebak di lapisan kedalaman 50 cm.
            Eksplorasi penampang di bawah untuk melihat distribusi suhu sensorik.
          </p>
        </div>

        <PeatCrossSectionSvg
          t20={36.4}
          t50={87.3}
          t100={42.0}
          waterTableCm={-55}
          highlightDepth={50}
          interactive={true}
        />
      </section>

      {/* 4 Langkah Alur Kerja */}
      <section className="py-16 px-6 border-t border-[#2D2424] bg-[#161212]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Alur Deteksi Dini Hingga Aksi Lapangan
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Dari tancapan fisik di hutan hingga pesan WhatsApp pemadaman presisi di tangan Manggala Agni.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#1C1616] border border-[#2D2424] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-[#EA580C]/20 border border-[#EA580C]/40 text-[#EA580C] flex items-center justify-center font-mono font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-sm font-semibold text-white">Penancapan Paku Logam</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Paku stainless steel 1 meter ditancapkan ke tanah gambut dengan 3 sensor DS18B20 pada kedalaman 20, 50, dan 100 cm.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#261E1E] text-[11px] font-mono text-neutral-400">
                Paku Suhu & Tiang Gas CO
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C1616] border border-[#2D2424] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-sm font-semibold text-white">Transmisi LoRa Jarak Jauh</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Paket biner 18-byte dipancarkan via frekuensi 433 MHz menembus kanopi hutan lebat hingga posko sejauh 3 kilometer.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#261E1E] text-[11px] font-mono text-neutral-400">
                Baterai tahan &gt;18 bulan
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C1616] border border-[#2D2424] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-sm font-semibold text-white">Fusi Algoritma & Vektor Rambat</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Mesin menganalisis regresi laju suhu harian, proyeksi arah rambat theta via gradien spasial, dan estimasi ETA jam.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#261E1E] text-[11px] font-mono text-neutral-400">
                Validasi 2 dari 3 sinyal
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#1C1616] border border-[#2D2424] flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center font-mono font-bold text-sm mb-4">
                  04
                </div>
                <h3 className="text-sm font-semibold text-white">Alert WhatsApp & Injeksi Air</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Pesan instan dikirim ke ponsel regu posko berisi tautan koordinat GPS, kedalaman pipa suntik, dan volume air yang dibutuhkan.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#261E1E] text-[11px] font-mono text-neutral-400">
                Injeksi Nozzle Presisi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2D2424] py-8 px-6 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#EA580C]" />
            <span className="font-mono text-neutral-400 font-bold">PAKUBARA 2026</span>
            <span>: Inovasi Sistem Monitoring Karhutla Gambut Presisi</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/demo" className="hover:text-white transition-colors">
              Simulator Juri
            </Link>
            <Link href="/status/blok-b-pulau-padang" className="hover:text-white transition-colors">
              Status Publik
            </Link>
            <Link href="/app" className="hover:text-white transition-colors">
              Posko Operasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
