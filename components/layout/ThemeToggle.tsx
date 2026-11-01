"use client";

import React, { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "pakubara.theme";
const CHANGE_EVENT = "pakubara:theme";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function readIsDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

/** Tema aktif, dibaca dari class pada <html>. Dipakai juga oleh grafik. */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, readIsDark, () => false);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const isDark = useIsDark();

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* penyimpanan tidak tersedia, pilihan tidak diingat */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      className={`w-11 h-11 flex items-center justify-center rounded-md text-stone-300 hover:bg-raised hover:text-stone-50 ${className}`}
    >
      {isDark ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
    </button>
  );
}
