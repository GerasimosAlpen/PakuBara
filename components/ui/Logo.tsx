"use client";

import React, { useState } from "react";
import { useIsDark } from "@/components/layout/ThemeToggle";

interface LogoProps {
  /** Tinggi logo dalam piksel. Lebar mengikuti rasio asli. */
  height?: number;
  className?: string;
}

const LIGHT_SRC = "/images/logo-pakubara.png";
const DARK_SRC = "/images/logo-pakubara-dark.png";

/**
 * Logo PakuBara. Mode gelap memakai logo-pakubara-dark.png bila ada, lalu jatuh ke logo biasa,
 * lalu ke teks. Teks juga tampil selama file logo belum diunggah.
 */
export function Logo({ height = 32, className = "" }: LogoProps) {
  const isDark = useIsDark();
  const [darkMissing, setDarkMissing] = useState(false);
  const [lightMissing, setLightMissing] = useState(false);

  const src = isDark && !darkMissing ? DARK_SRC : LIGHT_SRC;

  if (lightMissing) {
    return (
      <span className={`font-bold tracking-tight text-stone-50 ${className}`} style={{ fontSize: height * 0.7 }}>
        PakuBara
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- logo statis dari /public
    <img
      src={src}
      alt="PakuBara"
      height={height}
      style={{ height, width: "auto" }}
      onError={() => {
        if (src === DARK_SRC) setDarkMissing(true);
        else setLightMissing(true);
      }}
      className={className}
    />
  );
}
