"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Bell, ShieldAlert, Radio, ChevronDown, Activity, Sparkles } from "lucide-react";

interface AppNavbarProps {
  activeAreaName?: string;
  onSelectArea?: (areaId: string) => void;
}

export function AppNavbar({
  activeAreaName = "Blok B Hutan Gambut Lindung",
  onSelectArea,
}: AppNavbarProps) {
  const [openAlertCount, setOpenAlertCount] = useState<number>(1);
  const [isLive, setIsLive] = useState<boolean>(true);

  // Poll or check alerts
  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const res = await fetch("/api/alerts?status=open");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setOpenAlertCount(json.data.length);
        }
      } catch {
        // Fallback default
        setOpenAlertCount(1);
      }
    }
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand & Area Selector */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-950/30 group-hover:bg-red-500 transition-colors">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wider text-slate-100 font-mono flex items-center gap-1.5">
              PAKUBARA
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-sans font-normal border border-slate-700/60">
                v2.0
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Sistem Deteksi Bara Gambut Bawah Permukaan
            </div>
          </div>
        </Link>

        {/* Area dropdown switcher */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
          <span className="text-xs text-slate-400">Wilayah:</span>
          <button
            onClick={() => onSelectArea?.("a0000000-0000-0000-0000-000000000001")}
            className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700/80 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{activeAreaName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Status, Alerts & Quick Access */}
      <div className="flex items-center gap-2.5">
        {/* Live WebSocket Status indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-700/50 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold">LIVE LoRa Posko</span>
        </div>

        {/* Quick Simulator Link for Judges */}
        <Link
          href="/demo"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulator Juri</span>
        </Link>

        {/* Alert Bell */}
        <Link
          href="/app/alerts"
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 transition-colors"
          title="Pusat Peringatan Dini"
        >
          <Bell className="w-4 h-4" />
          {openAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              {openAlertCount}
            </span>
          )}
        </Link>

        {/* Profile / Admin Indicator */}
        <Link
          href="/login"
          className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-medium transition-colors"
        >
          Satgas Posko
        </Link>
      </div>
    </header>
  );
}

