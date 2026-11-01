"use client";

import React, { useState } from "react";

interface ImageSlotProps {
  /** Path di /public, misalnya /images/langkah-1-paku.webp */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Nama singkat untuk placeholder saat file belum diunggah */
  label: string;
  className?: string;
}

/**
 * Menampilkan gambar dari /public/images. Jika file belum ada, tampil placeholder
 * berlabel (bukan gambar pengganti) supaya jelas bahwa aset belum diunggah.
 */
export function ImageSlot({ src, alt, width, height, label, className = "" }: ImageSlotProps) {
  const [missing, setMissing] = useState(false);

  const checkLoaded = (img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) setMissing(true);
  };

  if (missing) {
    return (
      <div
        role="img"
        aria-label={`${alt} (gambar belum diunggah)`}
        style={{ aspectRatio: `${width} / ${height}` }}
        className={`w-full flex items-center justify-center rounded-lg border border-dashed border-line-strong bg-raised p-4 text-center text-xs text-stone-400 ${className}`}
      >
        Gambar belum diunggah: {label}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- aset statis dari /public, ukuran sudah ditetapkan
    <img
      ref={checkLoaded}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setMissing(true)}
      className={`w-full h-auto rounded-lg border border-line bg-raised ${className}`}
    />
  );
}
