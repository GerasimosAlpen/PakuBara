"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, FlaskConical, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { useOpenAlerts } from "./useOpenAlerts";
import { ThemeToggle } from "./ThemeToggle";

interface AreaOption {
  id: string;
  name: string;
}

const AVAILABLE_AREAS: AreaOption[] = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Blok B Pulau Padang (Riau)" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "KHG Kahayan - Sebangau (Kalteng)" },
  { id: "all", name: "Semua Wilayah Operasi (Lintas KHG)" },
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
  const pathname = usePathname();
  const { count, connected } = useOpenAlerts();
  const [areaMenuOpen, setAreaMenuOpen] = useState<boolean>(false);
  const [navOpen, setNavOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAreaMenuOpen(false);
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const alertLabel =
    count === null
      ? "Pusat alert, jumlah belum tersedia"
      : `Pusat alert, ${count} alert terbuka`;

  return (
    <header className="h-14 border-b border-line bg-surface px-3 sm:px-4 flex items-center justify-between sticky top-0 z-40 select-none">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <button
          type="button"
          onClick={() => setNavOpen((v) => !v)}
          aria-label={navOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={navOpen}
          className="md:hidden p-2.5 -ml-1 rounded-md text-stone-200 hover:bg-raised"
        >
          {navOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
        </button>

        <Link href="/" className="font-bold text-lg tracking-tight text-stone-50 shrink-0">
          PakuBara
        </Link>

        <div className="relative flex items-center gap-2 pl-3 sm:pl-5 border-l border-line min-w-0">
          <span className="text-xs text-stone-400 hidden lg:inline">Wilayah</span>
          <button
            type="button"
            onClick={() => setAreaMenuOpen(!areaMenuOpen)}
            className="flex items-center gap-2 text-sm text-stone-100 bg-raised hover:bg-line px-3 py-2 rounded-md border border-line min-w-0"
            aria-haspopup="menu"
            aria-expanded={areaMenuOpen}
          >
            <span className="max-w-[120px] sm:max-w-[220px] truncate">{activeAreaName}</span>
            <ChevronDown
              className={`w-4 h-4 text-stone-400 shrink-0 transition-transform ${areaMenuOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {areaMenuOpen && (
            <div
              className="absolute left-3 top-12 w-72 max-w-[calc(100vw-1.5rem)] bg-surface border border-line-strong rounded-lg shadow-2xl p-1 z-50 animate-fadeIn"
              role="menu"
            >
              {AVAILABLE_AREAS.map((area) => (
                <button
                  type="button"
                  key={area.id}
                  onClick={() => {
                    onSelectArea?.(area.id);
                    setAreaMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm ${
                    activeAreaId === area.id
                      ? "bg-raised text-stone-50 font-medium"
                      : "text-stone-300 hover:bg-raised hover:text-stone-50"
                  }`}
                  role="menuitemradio"
                  aria-checked={activeAreaId === area.id}
                >
                  {area.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-xs font-medium text-stone-300"
          role="status"
        >
          <span
            className={`w-2 h-2 rounded-full ${connected ? "bg-ok" : "bg-offline"}`}
            aria-hidden="true"
          />
          <span>{connected ? "Live" : "Terputus"}</span>
        </div>

        <Link
          href="/demo"
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-stone-200 rounded-md hover:bg-raised"
        >
          <FlaskConical className="w-4 h-4 text-accent" aria-hidden="true" />
          <span>Simulator Juri</span>
        </Link>

        <Link
          href="/app/alerts"
          className="relative p-2.5 rounded-md text-stone-300 hover:bg-raised"
          aria-label={alertLabel}
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {count !== null && count > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-crit text-white text-xs font-bold tabular flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>

        <ThemeToggle />

        <Link
          href="/login"
          className="text-sm px-3 py-2 rounded-md border border-line-strong text-stone-100 hover:bg-raised"
        >
          Masuk
        </Link>
      </div>

      {navOpen && (
        <nav
          className="md:hidden absolute left-0 right-0 top-14 bg-surface border-b border-line p-2 z-50 animate-fadeIn"
          aria-label="Navigasi utama"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm ${
                  isActive ? "bg-raised text-accent font-semibold" : "text-stone-200 hover:bg-raised"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/demo"
            onClick={() => setNavOpen(false)}
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm text-stone-200 hover:bg-raised"
          >
            <FlaskConical className="w-4 h-4 text-accent" aria-hidden="true" />
            <span>Simulator Juri</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
