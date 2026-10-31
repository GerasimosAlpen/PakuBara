"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Sliders, Map, Activity, ShieldCheck } from "lucide-react";
import { PakuBaraLogo } from "./AppSidebar";

interface AreaOption {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
}

const AVAILABLE_AREAS: AreaOption[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Sektor KHG Pulau Padang (Riau)",
    badge: "24 Paku + 6 CO",
    badgeColor: "bg-red-500",
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    name: "KHG Kahayan - Sebangau (Kalteng)",
    badge: "8 Paku + 2 CO",
    badgeColor: "bg-amber-500",
  },
  {
    id: "all",
    name: "Semua Wilayah Operasi (Lintas KHG)",
    badge: "Lintas Provinsi",
    badgeColor: "bg-sky-500",
  },
];

interface AppNavbarProps {
  activeAreaName?: string;
  activeAreaId?: string;
  onSelectArea?: (areaId: string) => void;
  breadcrumb?: string;
  pageTitle?: string;
}

export function AppNavbar({
  activeAreaName = "Sektor KHG Pulau Padang (Riau)",
  activeAreaId = "a0000000-0000-0000-0000-000000000001",
  onSelectArea,
  breadcrumb = "PUSAT OPERASI / PETA KOMANDO",
  pageTitle,
}: AppNavbarProps) {
  const [openAlertCount, setOpenAlertCount] = useState<number>(1);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="min-h-16 border-b border-slate-200 bg-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 select-none">
      {/* Left: Mobile Logo + Breadcrumb & Title or Wilayah Selector */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/" className="flex md:hidden items-center gap-2">
          <PakuBaraLogo className="w-8 h-8" />
          <span className="font-extrabold text-base tracking-tight">
            <span className="text-[#0284C7]">Paku</span>
            <span className="text-[#EA580C]">Bara</span>
          </span>
        </Link>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {breadcrumb}
          </div>
          <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
            {pageTitle ? (
              <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {pageTitle}
              </h1>
            ) : (
              <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Interactive Peat Fire Dashboard: {activeAreaName}
              </h1>
            )}

            {/* Area Switcher Dropdown */}
            {onSelectArea && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeAreaId === "a0000000-0000-0000-0000-000000000003"
                        ? "bg-amber-500"
                        : activeAreaId === "all"
                        ? "bg-sky-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="max-w-[160px] sm:max-w-[220px] truncate">{activeAreaName}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div
                    className="absolute left-0 top-9 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50"
                    role="menu"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Pilih Wilayah KHG Operasi
                    </div>
                    {AVAILABLE_AREAS.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => {
                          onSelectArea(area.id);
                          setMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          activeAreaId === area.id
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full ${area.badgeColor}`} />
                          <span className="truncate">{area.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 ml-2 shrink-0">
                          {area.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: PEMANTAUAN AKTIF Pill + Timestamp + Quick Nav */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile quick nav */}
        <div className="flex md:hidden items-center gap-1">
          <Link
            href="/app"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="Peta Komando"
          >
            <Map className="w-4 h-4" />
          </Link>
          <Link
            href="/app/nodes/PK-04"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="Diagnostik Sensor"
          >
            <Activity className="w-4 h-4" />
          </Link>
          <Link
            href="/app/alerts"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            title="Safety Log & WhatsApp"
          >
            <ShieldCheck className="w-4 h-4" />
          </Link>
        </div>

        {/* PEMANTAUAN AKTIF Pill matching Layar 1 */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PEMANTAUAN AKTIF</span>
        </div>

        {/* Timestamp matching Layar 1 */}
        <div className="hidden lg:block text-xs font-mono text-slate-500 border-l border-slate-200 pl-3">
          24 Okt 2026 | 14:30 WIB
        </div>

        {/* Simulator Juri Button */}
        <Link
          href="/demo"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-600" />
          <span>Simulator Juri</span>
        </Link>

        {/* Alert Bell */}
        <Link
          href="/app/alerts"
          className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors"
          title="Safety Log & Peringatan Dini"
        >
          <Bell className="w-4 h-4" />
          {openAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
              {openAlertCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
