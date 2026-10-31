"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Activity,
  ShieldCheck,
  Radio,
  Compass,
  BarChart3,
  FileText,
  Settings,
  Sliders,
  ExternalLink,
} from "lucide-react";

export function PakuBaraLogo({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      {/* Outer Diamond Shield */}
      <path
        d="M24 3L43 16.5L36 42H12L5 16.5L24 3Z"
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Soil Horizon & Underground Ember Zone */}
      <path d="M9.5 26H38.5L34.8 40H13.2L9.5 26Z" fill="#7C2D12" />
      <path d="M9.5 26H38.5L37.5 29.5H10.5L9.5 26Z" fill="#15803D" />
      {/* Glowing Ember Waves */}
      <circle cx="24" cy="34" r="6" fill="#EA580C" />
      <circle cx="24" cy="34" r="3.2" fill="#FEF08A" />
      {/* Wireless LoRa Waves */}
      <path
        d="M17.5 14.5C19.2 12.8 21.5 11.8 24 11.8C26.5 11.8 28.8 12.8 30.5 14.5"
        stroke="#0284C7"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14.5 11.5C17 9 20.3 7.6 24 7.6C27.7 7.6 31 9 33.5 11.5"
        stroke="#0284C7"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Stainless Sensor Probe Nail */}
      <rect x="22.3" y="14" width="3.4" height="19" rx="1.7" fill="#334155" stroke="#FFFFFF" strokeWidth="0.8" />
      <circle cx="24" cy="14" r="2.6" fill="#0284C7" />
    </svg>
  );
}

const PRIMARY_NAV = [
  { href: "/app", label: "Peta Komando", icon: Map, matchExact: true },
  { href: "/app/nodes/PK-04", label: "Diagnostik Sensor", icon: Activity, matchPrefix: "/app/nodes" },
  { href: "/app/alerts", label: "Safety Log & WhatsApp", icon: ShieldCheck, matchPrefix: "/app/alerts" },
  { href: "/app/devices", label: "Pengaturan Node LoRa", icon: Radio, matchPrefix: "/app/devices" },
];

const SECONDARY_NAV = [
  { href: "/app/risk", label: "Prioritas Siaga 1km²", icon: Compass },
  { href: "/app/analytics", label: "Analitik Efisiensi", icon: BarChart3 },
  { href: "/app/reports", label: "Laporan Audit KLHK", icon: FileText },
  { href: "/app/settings", label: "Parameter Sistem", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] select-none">
      <div className="p-4 space-y-5">
        {/* Brand Header matching Layar 1-3 */}
        <Link href="/" className="flex items-center gap-2.5 px-1 group">
          <PakuBaraLogo className="w-9 h-9 shrink-0" />
          <div className="leading-none">
            <div className="text-xl font-extrabold tracking-tight">
              <span className="text-[#0284C7]">Paku</span>
              <span className="text-[#EA580C]">Bara</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
              Subsurface Peat Telemetry
            </div>
          </div>
        </Link>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1.5">
            Pusat Operasi
          </div>

          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.matchExact
              ? pathname === item.href
              : item.matchPrefix
              ? pathname.startsWith(item.matchPrefix)
              : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#0D2B1D] text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            Analitik & Regulasi
          </div>

          {SECONDARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#0D2B1D] text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-300" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Gateway Status & Operator Profile matching Layar 1-3 */}
      <div className="p-4 border-t border-slate-200 space-y-3 bg-white">
        {/* LoRaWAN Gateway Status Card */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>LoRaWAN Gateway Status</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-slate-800 truncate">
              Posko KHG Riau - Terhubung
            </span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 pl-4">
            (RSSI -82 dBm · SNR +7.8 dB)
          </div>
        </div>

        {/* Simulator Juri & Public Status */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/demo"
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-semibold transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-700" />
            <span>Simulator Juri</span>
          </Link>
          <Link
            href="/status/blok-b-pulau-padang"
            target="_blank"
            title="Halaman Status Publik Desa"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Operator Profile Row */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
            PR
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate">Posko KHG Riau</div>
            <div className="text-[11px] text-slate-500 truncate">Operator lapangan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
