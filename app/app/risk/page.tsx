"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RiskFactorBars } from "@/components/charts/RiskFactorBars";
import {
  Compass,
  FileDown,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Layers,
  MapPin,
  Info,
} from "lucide-react";

interface RiskCell {
  id: string;
  name: string;
  coordinates: string;
  score: number;
  factors: {
    cuaca: number;
    historis: number;
    gambut: number;
    akses: number;
  };
  reasons: string[];
}

const RISK_CELLS: RiskCell[] = [
  {
    id: "CELL-002",
    name: "Blok B Hutan Gambut Lindung (Padang Utara)",
    coordinates: "1.234°S, 102.678°E",
    score: 92,
    factors: { cuaca: 0.9, historis: 0.85, gambut: 0.95, akses: 0.7 },
    reasons: [
      "Kedalaman gambut > 3.5 meter dengan kadar air serasah di bawah 30%",
      "Anomali suhu 50 cm terdeteksi di probe PK-04 (87.3°C)",
      "Arah angin 14 km/jam mengarah ke zona perkebunan masyarakat",
    ],
  },
  {
    id: "CELL-007",
    name: "Sektor Timur Sekat Kanal Primer 4",
    coordinates: "1.240°S, 102.685°E",
    score: 78,
    factors: { cuaca: 0.85, historis: 0.75, gambut: 0.8, akses: 0.65 },
    reasons: [
      "Tinggi Muka Air (TMA) berada pada -58 cm (di bawah ambang batas PP 57/2016)",
      "Jarak ke sumber air pemadaman terdekat > 1.2 kilometer",
      "Riwayat terbakar pada El Nino 2019",
    ],
  },
  {
    id: "CELL-011",
    name: "Zona Penyangga Perkebunan Blok A",
    coordinates: "1.225°S, 102.660°E",
    score: 64,
    factors: { cuaca: 0.7, historis: 0.6, gambut: 0.7, akses: 0.5 },
    reasons: [
      "Aktivitas perambahan dan pembukaan lahan tanpa izin",
      "Kerapatan semak belukar kering tinggi di batas konsesi",
      "Sensor LoRa GS-02 mendeteksi fluktuasi gas karbon monoksida",
    ],
  },
  {
    id: "CELL-015",
    name: "Hutan Lindung Sekunder Tanjung Padang",
    coordinates: "1.250°S, 102.695°E",
    score: 35,
    factors: { cuaca: 0.4, historis: 0.3, gambut: 0.45, akses: 0.2 },
    reasons: [
      "Tinggi muka air tanah terjaga baik (-20 cm)",
      "Kanopi vegetasi lebat dan kelembaban udara > 75%",
      "Akses patroli darat sangat baik via posko Daops",
    ],
  },
];

export default function RiskPriorityPage() {
  const [selectedCell, setSelectedCell] = useState<RiskCell>(RISK_CELLS[0]);

  const handleDownloadCsv = () => {
    const headers = "Cell_ID,Nama_Area,Koordinat,Skor_Prioritas,F_Cuaca,F_Historis,F_Gambut,F_Akses\n";
    const rows = RISK_CELLS.map(
      (c) =>
        `${c.id},"${c.name}","${c.coordinates}",${c.score},${c.factors.cuaca},${c.factors.historis},${c.factors.gambut},${c.factors.akses}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `prioritas-siaga-1km2-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-ink text-stone-100 flex flex-col select-none">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-stone-50 flex items-center gap-2">
                <Compass className="w-5 h-5 text-accent" />
                PETA PRIORITAS SIAGA 1 KM²
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Kalkulasi spasial multikriteria: Cuaca (Open-Meteo), Historis (NASA FIRMS), Gambut (Kemen LHK), dan Aksesibilitas.
              </p>
            </div>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-line border border-line text-stone-200 text-xs font-semibold transition-colors"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Unduh Matriks CSV Grid</span>
            </button>
          </div>

          {/* Grid Layout: Top 20 Sidebar & Detailed Cell Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 20 List */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-stone-400">
                Peringkat Sel Grid Tertinggi (1 km²)
              </h3>

              <div className="space-y-2">
                {RISK_CELLS.map((cell) => {
                  const isSelected = selectedCell.id === cell.id;
                  return (
                    <button
                      type="button"
                      key={cell.id}
                      onClick={() => setSelectedCell(cell)}
                      aria-pressed={isSelected}
                      className={`w-full text-left p-3.5 rounded-xl border  transition-all ${
                        isSelected
                          ? "bg-raised border-ember  "
                          : "bg-surface border-line hover:border-line-strong"
                      }`}
                    >
                      <span className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-mono text-stone-50">{cell.id}</span>
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                            cell.score >= 80
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : cell.score >= 60
                              ? "bg-amber-950 text-amber-400 border border-amber-800"
                              : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          }`}
                        >
                          Skor {cell.score}
                        </span>
                      </span>
                      <span className="block text-xs text-stone-300 font-medium truncate">{cell.name}</span>
                      <span className="block text-xs text-stone-400 font-mono mt-0.5">
                        {cell.coordinates}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inspector Detail Sel Terpilih */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-xl bg-surface border border-line space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-400">
                      Inspeksi Sel Grid 1 km²
                    </span>
                    <h2 className="text-lg font-bold text-stone-50 font-mono flex items-center gap-2">
                      <span>{selectedCell.id}: {selectedCell.name}</span>
                    </h2>
                    <div className="text-xs text-stone-400 font-mono mt-0.5">
                      Koordinat Pusat: {selectedCell.coordinates}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-stone-400 block">
                      Tingkat Siaga
                    </span>
                    <span className="text-2xl font-black font-mono text-red-500">
                      {selectedCell.score} / 100
                    </span>
                  </div>
                </div>

                {/* 3 Alasan Terbesar Tingginya Risiko */}
                <div className="p-4 rounded-xl bg-ink border border-line space-y-2">
                  <div className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-accent" />
                    <span>3 Faktor Pemicu Risiko Utama:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-300">
                    {selectedCell.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-ember mt-1.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ECharts Dekomposisi Faktor */}
                <RiskFactorBars factors={selectedCell.factors} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

