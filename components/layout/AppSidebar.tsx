"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Bell,
  Flame,
  BarChart3,
  Radio,
  FileText,
  Settings,
  Sparkles,
  Compass,
  Layers,
  ExternalLink,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/app", label: "Peta Komando", icon: Map },
  { href: "/app/alerts", label: "Pusat Alert", icon: Flame, badge: "1" },
  { href: "/app/risk", label: "Prioritas Siaga 1km²", icon: Compass },
  { href: "/app/areas/a0000000-0000-0000-0000-000000000001", label: "Detail Area", icon: Layers },
  { href: "/app/analytics", label: "Analitik Karhutla", icon: BarChart3 },
  { href: "/app/devices", label: "Perangkat & Gateway", icon: Radio },
  { href: "/app/reports", label: "Laporan Audit", icon: FileText },
  { href: "/app/settings", label: "Pengaturan Sistem", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 hidden md:flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto select-none">
      <div className="p-3 space-y-1">
        <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
          Pusat Operasi Lapangan
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-slate-800 text-sky-400 font-semibold border-l-2 border-sky-500"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800/80 text-[10px] font-bold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Simulator, Status Publik & Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <Link
          href="/demo"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-xs font-medium transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Simulator Juri</span>
          </div>
          <span className="text-[10px] font-mono bg-slate-700/80 px-1.5 py-0.5 rounded text-slate-300 border border-slate-600/50">
            DEMO
          </span>
        </Link>

        <Link
          href="/status/blok-b-pulau-padang"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors hover:bg-slate-800"
        >
          <span>Status Publik Desa</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </Link>

        <div className="px-3 pt-2 text-[10px] text-slate-400 font-mono">
          <div>Posko Gambut Pulau Padang</div>
          <div>Koordinat: 1.234°S, 102.678°E</div>
        </div>
      </div>
    </aside>
  );
}

