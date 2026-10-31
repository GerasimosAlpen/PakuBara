"use client";

import React, { useState } from "react";

interface PeatCrossSectionSvgProps {
  t20?: number;
  t50?: number;
  t100?: number;
  waterTableCm?: number;
  highlightDepth?: number;
  interactive?: boolean;
}

export function PeatCrossSectionSvg({
  t20 = 34,
  t50 = 542,
  t100 = 68,
  waterTableCm = -55,
  highlightDepth = 50,
  interactive = false,
}: PeatCrossSectionSvgProps) {
  const [selectedDepth, setSelectedDepth] = useState<number>(highlightDepth);

  return (
    <div className="flex flex-col bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 w-full select-none">
      <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
        <span>Pipa Probe Stainless SUS 304</span>
        <span className="text-[11px] font-mono text-slate-500">TMA: {waterTableCm} cm</span>
      </div>

      <div className="relative w-full aspect-[16/10] bg-white rounded-lg overflow-hidden border border-slate-200">
        <svg viewBox="0 0 460 270" className="w-full h-full">
          <defs>
            <linearGradient id="topSoilBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E6F0E2" />
              <stop offset="100%" stopColor="#D7E6D2" />
            </linearGradient>
            <linearGradient id="upperPeatBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F3EFEA" />
              <stop offset="100%" stopColor="#EAE3DC" />
            </linearGradient>
            <linearGradient id="pyrolysisBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE8E8" />
              <stop offset="50%" stopColor="#FBD5D5" />
              <stop offset="100%" stopColor="#F3E5D8" />
            </linearGradient>
            <linearGradient id="deepPeatBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E5DDD3" />
              <stop offset="100%" stopColor="#D6CBBF" />
            </linearGradient>
            <radialGradient id="pyrolysisCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#EA580C" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sky / Above Surface */}
          <rect x="0" y="0" width="460" height="42" fill="#F8FAFC" />

          {/* 0 cm Surface Grass Line */}
          <rect x="0" y="42" width="460" height="38" fill="url(#topSoilBand)" />
          <line x1="0" y1="42" x2="460" y2="42" stroke="#16A34A" strokeWidth="2.5" />

          {/* 20 cm Layer */}
          <rect x="0" y="80" width="460" height="45" fill="url(#upperPeatBand)" />
          <line x1="0" y1="80" x2="460" y2="80" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4,4" />

          {/* 50 cm Pyrolysis Zone */}
          <rect x="0" y="125" width="460" height="75" fill="url(#pyrolysisBand)" />
          <line x1="0" y1="125" x2="460" y2="125" stroke="#FCA5A5" strokeWidth="1" strokeDasharray="4,4" />

          {/* 100 cm Deep Peat Layer */}
          <rect x="0" y="200" width="460" height="70" fill="url(#deepPeatBand)" />
          <line x1="0" y1="200" x2="460" y2="200" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4,4" />

          {/* Concentric Pyrolysis Glow around 50 cm */}
          <ellipse cx="195" cy="160" rx="95" ry="34" fill="url(#pyrolysisCore)" />
          <circle
            cx="195"
            cy="160"
            r="26"
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />

          {/* Depth Ruler Labels on Left */}
          <text x="16" y="36" fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="700">
            0 cm
          </text>
          <text x="58" y="36" fill="#64748B" fontSize="10">
            Permukaan tanah
          </text>

          <text x="16" y="96" fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="700">
            20 cm
          </text>

          <text x="16" y="164" fill="#DC2626" fontSize="11" fontFamily="monospace" fontWeight="800">
            50 cm
          </text>

          <text x="16" y="232" fill="#475569" fontSize="11" fontFamily="monospace" fontWeight="700">
            100 cm
          </text>

          {/* Stainless Probe Top Cap (LoRa Transmitter Box) */}
          <rect
            x="177"
            y="10"
            width="36"
            height="22"
            rx="4"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="1.5"
          />
          <text x="184" y="24" fill="#FFFFFF" fontSize="9" fontFamily="monospace" fontWeight="700">
            LoRa
          </text>

          {/* Stainless Steel SUS 304 Rod */}
          <rect
            x="191"
            y="32"
            width="8"
            height="212"
            rx="4"
            fill="#94A3B8"
            stroke="#475569"
            strokeWidth="1.2"
          />
          {/* Pointed Tip */}
          <polygon points="191,242 199,242 195,256" fill="#475569" />

          {/* Sensor Node 20 cm */}
          <circle cx="195" cy="92" r="6" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
          <text x="212" y="96" fill="#15803D" fontSize="12" fontFamily="monospace" fontWeight="800">
            {t20}°C
          </text>
          <text x="262" y="96" fill="#64748B" fontSize="10">
            (Lapisan atas aman)
          </text>

          {/* Sensor Node 50 cm (Pyrolysis Core) */}
          <circle cx="195" cy="160" r="8" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
          <text x="214" y="157" fill="#DC2626" fontSize="13" fontFamily="monospace" fontWeight="800">
            {t50}°C
          </text>
          <text x="214" y="172" fill="#B91C1C" fontSize="10" fontWeight="800">
            BARA AKTIF · ZONA PIROLISIS
          </text>

          {/* Sensor Node 100 cm */}
          <circle cx="195" cy="228" r="6" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />
          <text x="212" y="232" fill="#B45309" fontSize="12" fontFamily="monospace" fontWeight="800">
            {t100}°C
          </text>
          <text x="262" y="232" fill="#64748B" fontSize="10">
            (Gambut dalam)
          </text>
        </svg>
      </div>

      {interactive && (
        <div className="w-full mt-3 bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex justify-between text-xs text-slate-700 mb-1">
            <span className="font-medium">Simulasi Kedalaman Suntik Peat Nozzle:</span>
            <span className="font-mono text-emerald-700 font-bold">{selectedDepth} cm</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={selectedDepth}
            onChange={(e) => setSelectedDepth(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D2B1D]"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>Dangkal (10 cm)</span>
            <span>Inti Pirolisis ({highlightDepth} cm)</span>
            <span>Dalam (100 cm)</span>
          </div>
        </div>
      )}
    </div>
  );
}
