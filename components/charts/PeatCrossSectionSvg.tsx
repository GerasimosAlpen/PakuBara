"use client";

import React, { useState } from "react";

interface PeatCrossSectionSvgProps {
  t20?: number;
  t50?: number;
  t100?: number;
  waterTableCm?: number; // negative value e.g. -45 cm
  highlightDepth?: number;
  interactive?: boolean;
}

export function PeatCrossSectionSvg({
  t20 = 36.4,
  t50 = 87.3,
  t100 = 42.0,
  waterTableCm = -55,
  highlightDepth = 50,
  interactive = true,
}: PeatCrossSectionSvgProps) {
  const [selectedDepth, setSelectedDepth] = useState<number>(highlightDepth);

  // Helper for color based on temperature
  const getTempColor = (temp: number) => {
    if (temp >= 80) return "#DC2626"; // red
    if (temp >= 60) return "#EA580C"; // orange
    if (temp >= 45) return "#F59E0B"; // amber
    return "#10B981"; // emerald normal
  };

  return (
    <div className="flex flex-col items-center bg-surface border border-line rounded-xl p-4 w-full">
      <div className="flex justify-between items-center w-full mb-3">
        <div>
          <h4 className="text-sm font-semibold text-stone-50 tracking-wide">
            Penampang Vertikal Gambut (Profil Kedalaman)
          </h4>
          <p className="text-xs text-stone-400">
            Sensor paku mengukur 3 kedalaman kritis: 20 cm, 50 cm, 100 cm
          </p>
        </div>
        {Math.max(t20, t50, t100) >= 60 ? (
          <div className="flex items-center gap-2" role="status">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-crit" aria-hidden="true" />
            <span className="text-xs font-medium text-red-300">Bara terdeteksi</span>
          </div>
        ) : (
          <div className="flex items-center gap-2" role="status">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-ok" aria-hidden="true" />
            <span className="text-xs font-medium text-stone-300">Suhu normal</span>
          </div>
        )}
      </div>

      <div className="relative w-full max-w-lg aspect-[4/3] bg-[#121010] rounded-lg overflow-hidden border border-line">
        <svg viewBox="0 0 400 300" className="w-full h-full select-none">
          <defs>
            {/* Linear gradients for soil stratigraphy */}
            <linearGradient id="litterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A3B32" />
              <stop offset="100%" stopColor="#2F221A" />
            </linearGradient>

            <linearGradient id="smolderGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#381E15" />
              <stop offset="50%" stopColor="#7C2D12" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#1E130D" />
            </linearGradient>

            <linearGradient id="deepPeatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1C1410" />
              <stop offset="100%" stopColor="#0B0806" />
            </linearGradient>

            {/* Ember radial glow */}
            <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="1" />
              <stop offset="40%" stopColor="#EF4444" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#7C2D12" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Layer 1: Surface Vegetation & Litter (0 to -20cm) */}
          <rect x="0" y="30" width="400" height="40" fill="url(#litterGrad)" />
          <line x1="0" y1="30" x2="400" y2="30" stroke="#10B981" strokeWidth="2.5" />
          <text x="12" y="55" fill="#A3A3A3" fontSize="10" fontFamily="monospace">
            0 - 20 cm: Serasah & Gambut Kering (Aerobik)
          </text>

          {/* Layer 2: Smoldering Pyrolysis Zone (20 to 60cm) */}
          <rect x="0" y="70" width="400" height="90" fill="url(#smolderGrad)" />
          <text x="12" y="115" fill="#F97316" fontSize="10" fontWeight="bold" fontFamily="monospace">
            20 - 60 cm: Zona Pirolisis & Pembaraan Tanpa Lidah Api
          </text>

          {/* Ember heat core around 50cm */}
          <ellipse cx="200" cy="120" rx="90" ry="30" fill="url(#emberGlow)" />

          {/* Layer 3: Deep Peat & Saturated Zone (60 to 120cm) */}
          <rect x="0" y="160" width="400" height="140" fill="url(#deepPeatGrad)" />
          <text x="12" y="210" fill="#737373" fontSize="10" fontFamily="monospace">
            60 - 120 cm: Gambut Dalam Jenuh Air (Anaerobik)
          </text>

          {/* Water Table (TMA - Tinggi Muka Air Tanah) */}
          <g>
            <line
              x1="0"
              y1="130"
              x2="400"
              y2="130"
              stroke="#38BDF8"
              strokeWidth="1.5"
              strokeDasharray="6,4"
            />
            <rect x="270" y="122" width="120" height="16" rx="3" fill="#0369A1" fillOpacity="0.8" />
            <text x="275" y="134" fill="#E0F2FE" fontSize="9" fontFamily="monospace">
              TMA: {waterTableCm} cm (Kritis)
            </text>
          </g>

          {/* The Paku Probe Stainless Steel Shaft */}
          <rect x="198" y="20" width="4" height="230" fill="#94A3B8" rx="2" />
          {/* Probe Top Transceiver Housing */}
          <rect x="190" y="10" width="20" height="15" fill="#EA580C" rx="3" />
          <text x="195" y="21" fill="#FFFFFF" fontSize="8" fontWeight="bold">LoRa</text>

          {/* Sensor 1: 20 cm (y = 70) */}
          <circle
            cx="200"
            cy="70"
            r="6"
            fill={getTempColor(t20)}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <text x="215" y="74" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">
            20 cm: {t20}°C
          </text>

          {/* Sensor 2: 50 cm (y = 120) - Ember Zone */}
          <circle
            cx="200"
            cy="120"
            r="8"
            fill={getTempColor(t50)}
            stroke="#FEF08A"
            strokeWidth="2"
          />
          <text x="215" y="124" fill="#FEF08A" fontSize="12" fontWeight="bold" fontFamily="monospace">
            50 cm: {t50}°C (Pusat Bara)
          </text>

          {/* Sensor 3: 100 cm (y = 210) */}
          <circle
            cx="200"
            cy="210"
            r="6"
            fill={getTempColor(t100)}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
          <text x="215" y="214" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">
            100 cm: {t100}°C
          </text>

          {/* Infiltration & Air Injection Arrow */}
          <g>
            <path
              d="M 120 70 L 120 115"
              stroke="#F59E0B"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
            <text x="50" y="95" fill="#F59E0B" fontSize="9" fontFamily="sans-serif">
              Injeksi Air Disarankan
            </text>
          </g>
        </svg>
      </div>

      {interactive && (
        <div className="w-full mt-4 bg-ink p-3 rounded-lg border border-line">
          <div className="flex justify-between text-xs text-stone-300 mb-1">
            <span>Kedalaman Injeksi Nozzle:</span>
            <span className="font-mono text-amber-400 font-bold">{selectedDepth} cm</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={selectedDepth}
            onChange={(e) => setSelectedDepth(Number(e.target.value))}
            className="w-full h-1.5 bg-line rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
          />
          <div className="flex justify-between text-xs text-stone-400 mt-1">
            <span>Dangkal (10 cm)</span>
            <span>Optimal Bara ({highlightDepth} cm)</span>
            <span>Dalam (100 cm)</span>
          </div>
        </div>
      )}
    </div>
  );
}

