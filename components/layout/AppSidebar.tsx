"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, ExternalLink, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { useOpenAlerts } from "./useOpenAlerts";

const STORAGE_KEY = "pakubara.sidebar.collapsed";
const CHANGE_EVENT = "pakubara:sidebar";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AppSidebar() {
  const pathname = usePathname();
  const { count } = useOpenAlerts();
  const collapsed = useSyncExternalStore(subscribe, readCollapsed, () => false);

  const toggle = () => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "0" : "1");
    } catch {
      /* penyimpanan tidak tersedia, pilihan tidak diingat */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <aside
      className={`${collapsed ? "w-14" : "w-60"} border-r border-line bg-surface hidden md:flex flex-col justify-between shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto transition-[width] duration-150`}
      aria-label="Navigasi utama"
    >
      <nav className="p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const showCount = "showsAlertCount" in item && count !== null && count > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-raised text-accent font-semibold"
                  : "text-stone-300 hover:bg-raised hover:text-stone-50"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {showCount && (
                <span
                  className={`${collapsed ? "sr-only" : "tabular text-xs font-bold px-1.5 py-0.5 rounded bg-crit text-white"}`}
                >
                  {count}
                  {collapsed ? " alert terbuka" : ""}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-line space-y-0.5">
        <Link
          href="/demo"
          title={collapsed ? "Simulator Juri" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-stone-200 hover:bg-raised transition-colors"
        >
          <FlaskConical className="w-4 h-4 shrink-0 text-accent" aria-hidden="true" />
          {!collapsed && <span>Simulator Juri</span>}
        </Link>

        <Link
          href="/status/blok-b-pulau-padang"
          target="_blank"
          rel="noopener"
          title={collapsed ? "Status Publik Desa" : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-stone-400 hover:text-stone-100 hover:bg-raised transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>Status Publik Desa</span>}
          {collapsed && <span className="sr-only">Status Publik Desa (tab baru)</span>}
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Lebarkan sidebar" : "Ciutkan sidebar"}
          aria-expanded={!collapsed}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-stone-400 hover:text-stone-100 hover:bg-raised transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          {!collapsed && <span>Ciutkan</span>}
        </button>
      </div>
    </aside>
  );
}
