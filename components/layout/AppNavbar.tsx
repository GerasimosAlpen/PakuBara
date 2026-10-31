"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Bell, ShieldAlert, Radio, ChevronDown, Activity, Sparkles } from "lucide-react";

interface AreaOption {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
}

const AVAILABLE_AREAS: AreaOption[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Blok B Pulau Padang (Riau)",
    badge: "8 Paku + 2 Gas",
    badgeColor: "bg-red-500",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "KHG Kahayan - Sebangau (Kalteng)",
    badge: "8 Paku + 2 Gas",
    badgeColor: "bg-amber-500",
  },
  {
    id: "all",
    name: "Semua Wilayah Operasi (Lintas KHG)",
    badge: "16 Paku + 4 Gas",
    badgeColor: "bg-sky-500",
  },
];

interface AppNavbarProps {
  activeAreaName?: string;
  activeAreaId?: string;
  onSelectArea?: (areaId: string) => void;
}

export function AppNavbar({
  activeAreaName = "Blok B Pulau Padang (Riau)",
  activeAreaId = "a0000000-0000-0000-0000-000000000001",
  onSelectArea,
}: AppNavbarProps) {
  const [openAlertCount, setOpenAlertCount] = useState<number>(1);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // Poll open alerts count
  useEffect(() => {
    async function fetchAlertCount() {
      try {
        const res = await fetch("/api/alerts?status=open");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setOpenAlertCount(json.data.length);
        }
      } catch {
        setOpenAlertCount(1);
      }
    }
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation & outside click dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        <div className="relative flex items-center gap-2 pl-3 sm:pl-4 border-l border-slate-800">
          <span className="text-xs text-slate-400 hidden lg:inline">Wilayah:</span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activeAreaId === "a0000000-0000-0000-0000-000000000003"
                  ? "bg-amber-400"
                  : activeAreaId === "all"
                  ? "bg-sky-400"
                  : "bg-red-500"
              }`}
            />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{activeAreaName}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div
              className="absolute left-3 top-10 w-72 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn"
              role="menu"
            >
              <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Pilih Wilayah Operasi
              </div>
              {AVAILABLE_AREAS.map((area) => (
                <button
                  key={area.id}
                  onClick={() => {
                    onSelectArea?.(area.id);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    activeAreaId === area.id
                      ? "bg-slate-800 text-white font-medium"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-2 h-2 rounded-full ${area.badgeColor}`} />
                    <span className="truncate">{area.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 ml-2 shrink-0">
                    {area.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
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

