"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Radio,
  Flame,
  Droplets,
  Map,
  Activity,
  MessageSquare,
  Sliders,
} from "lucide-react";
import { PakuBaraLogo } from "@/components/layout/AppSidebar";

const SCREEN_SHOWCASE = [
  {
    id: "layar-1",
    tabLabel: "Layar 1: Peta Komando",
    title: "Interactive Peat Fire Dashboard (Sektor KHG Pulau Padang)",
    description:
      "Pemetaan topografi sektor KHG, status 24 paku sensor suhu & 6 tiang CO secara real-time, serta vektor prediksi rambat bara bawah tanah (4,2 cm/jam menuju Batas Desa).",
    imageSrc: "/screens/layar-1-peta-komando.png",
    routeHref: "/app",
    routeCta: "Buka Layar 1 Interaktif",
    icon: Map,
  },
  {
    id: "layar-2",
    tabLabel: "Layar 2: Diagnostik Sensor",
    title: "Diagnostik Sensor Multi-Kedalaman & Peat Nozzle Guide (Node PK-04)",
    description:
      "Pemantauan lonjakan gas CO malam hari (15 ke 185 ppm), komparasi suhu 20 cm (34°C aman di permukaan) vs 50 cm (542°C inti pirolisis), dan panduan suntik air presisi 120 Liter/titik.",
    imageSrc: "/screens/layar-2-diagnostik-sensor.png",
    routeHref: "/app/nodes/PK-04",
    routeCta: "Buka Layar 2 Interaktif",
    icon: Activity,
  },
  {
    id: "layar-3",
    tabLabel: "Layar 3: Safety Log & WhatsApp",
    title: "Protokol Verifikasi 72 Jam & Automated WhatsApp Alert Bot",
    description:
      "Pemantauan pendinginan lahan 72 jam sesuai Permen LHK P.32/2016 sebelum armada ditarik, tabel log intervensi Manggala Agni, dan notifikasi WhatsApp otomatis dalam 1,8 detik.",
    imageSrc: "/screens/layar-3-safety-log.png",
    routeHref: "/app/alerts",
    routeCta: "Buka Layar 3 Interaktif",
    icon: MessageSquare,
  },
];

export default function LandingPage() {
  const [activeScreen, setActiveScreen] = useState(SCREEN_SHOWCASE[0]);

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900">
      {/* Top Navbar */}
      <nav className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <PakuBaraLogo className="w-9 h-9" />
          <div>
            <span className="font-extrabold text-xl tracking-tight">
              <span className="text-[#0284C7]">Paku</span>
              <span className="text-[#EA580C]">Bara</span>
            </span>
            <span className="hidden sm:inline-block ml-2.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Subsurface Peat Fire Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/demo"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-700" />
            <span>Simulator Juri</span>
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0D2B1D] hover:bg-[#143d29] text-white transition-colors shadow-xs"
          >
            <span>Masuk Pusat Operasi</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-12 pb-10 max-w-6xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Verifikasi Darat Dua Lapis · Tiang Gas CO &amp; Paku Sensor Suhu Multi-Kedalaman</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15]">
            Deteksi Dini Bara Bawah Tanah Gambut &amp; Panduan Injeksi Air Presisi
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Kebakaran gambut merambat secara tersembunyi di zona pirolisis kedalaman 50 cm (hingga 542°C)
            sementara permukaan tampak dingin dan aman (34°C tanpa asap). PakuBara menggabungkan jaringan
            LoRaWAN, tiang pemantau CO, dan paku probe stainless SUS 304 untuk memandu penyuntikan air
            Peat Nozzle langsung ke titik bara.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <Map className="w-4 h-4 text-emerald-300" />
              <span>Layar 1: Peta Komando</span>
            </Link>

            <Link
              href="/app/nodes/PK-04"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 border border-slate-200 font-bold text-xs sm:text-sm transition-colors"
            >
              <Activity className="w-4 h-4 text-sky-700" />
              <span>Layar 2: Diagnostik Sensor PK-04</span>
            </Link>

            <Link
              href="/app/alerts"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 border border-slate-200 font-bold text-xs sm:text-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Layar 3: Safety Log &amp; WhatsApp</span>
            </Link>
          </div>

          {/* 4 Field Operational Metrics */}
          <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Jaringan Sensor KHG</span>
                <Radio className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                24 Paku &amp; 6 Tiang CO
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Transmisi jarak jauh LoRaWAN
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Deteksi Zona Pirolisis</span>
                <Flame className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-xl font-extrabold text-red-600 mt-1">
                50 cm (542°C)
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Saat permukaan masih 34°C
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Efisiensi Peat Nozzle</span>
                <Droplets className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xl font-extrabold text-sky-700 mt-1">
                120 Liter / titik
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Hemat air 52-55% vs siram atas
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Verifikasi Lahan Aman</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">
                72 Jam Stabil
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Kepatuhan Permen LHK P.32/2016
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 3-Screen Architecture Showcase */}
      <section className="px-4 sm:px-8 pb-16 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Arsitektur Antarmuka Operasi Lapangan
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Tiga Layar Utama Pusat Operasi PakuBara
            </h2>
          </div>

          {/* Screen Switcher Tabs */}
          <div className="inline-flex flex-wrap gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
            {SCREEN_SHOWCASE.map((item) => {
              const Icon = item.icon;
              const isSelected = activeScreen.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveScreen(item)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isSelected
                      ? "bg-[#0D2B1D] text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : "text-slate-400"}`} />
                  <span>{item.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Screen Preview Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {activeScreen.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
                {activeScreen.description}
              </p>
            </div>
            <Link
              href={activeScreen.routeHref}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <span>{activeScreen.routeCta}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <Image
              src={activeScreen.imageSrc}
              alt={activeScreen.title}
              width={1600}
              height={950}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <PakuBaraLogo className="w-6 h-6" />
            <span className="font-bold text-slate-800">PakuBara</span>
            <span>· Verifikasi darat dua lapis · Tiang CO &amp; paku sensor suhu multi-kedalaman</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <Link href="/app" className="hover:text-slate-900">
              Peta Komando
            </Link>
            <Link href="/app/nodes/PK-04" className="hover:text-slate-900">
              Diagnostik Sensor
            </Link>
            <Link href="/app/alerts" className="hover:text-slate-900">
              Safety Log &amp; WA
            </Link>
            <Link href="/demo" className="hover:text-slate-900">
              Simulator Juri
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
