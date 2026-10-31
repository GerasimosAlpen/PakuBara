"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RiskFactorBars } from "@/components/charts/RiskFactorBars";
import { FileDown, Info } from "lucide-react";

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
    coordinates: "0°58'12.4\"N, 102°24'08.1\"E",
    score: 92,
    factors: { cuaca: 0.9, historis: 0.85, gambut: 0.95, akses: 0.7 },
    reasons: [
      "Kedalaman gambut > 3.5 meter dengan kadar air serasah di bawah 30%",
      "Anomali suhu 50 cm terdeteksi di probe PK-04 (542°C) disertai CO 185 ppm",
      "Arah angin 14 km/jam mengarah ke Batas Desa (Timur Laut)",
    ],
  },
  {
    id: "CELL-007",
    name: "Sektor Timur Sekat Kanal Primer 4",
    coordinates: "0°58'16.1\"N, 102°24'18.9\"E",
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
    coordinates: "0°58'18.4\"N, 102°24'01.0\"E",
    score: 64,
    factors: { cuaca: 0.7, historis: 0.6, gambut: 0.7, akses: 0.5 },
    reasons: [
      "Aktivitas pembukaan lahan di sekitar koridor kanal sekunder",
      "Kerapatan semak belukar kering tinggi di batas konsesi",
      "Tiang CO-02 mendeteksi fluktuasi gas karbon monoksida malam hari",
    ],
  },
  {
    id: "CELL-015",
    name: "Hutan Lindung Sekunder Tanjung Padang",
    coordinates: "0°58'05.5\"N, 102°23'53.8\"E",
    score: 35,
    factors: { cuaca: 0.4, historis: 0.3, gambut: 0.45, akses: 0.2 },
    reasons: [
      "Tinggi muka air tanah terjaga baik (-20 cm)",
      "Kanopi vegetasi lebat dan kelembaban udara > 75%",
      "Akses patroli darat sangat baik via posko KHG Riau",
    ],
  },
];

export default function RiskPriorityPage() {
  const [selectedCell, setSelectedCell] = useState<RiskCell>(RISK_CELLS[0]);

  const handleDownloadCsv = () => {
    const headers =
      "Cell_ID,Nama_Area,Koordinat,Skor_Prioritas,F_Cuaca,F_Historis,F_Gambut,F_Akses\n";
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
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          breadcrumb="ANALITIK & REGULASI / PRIORITAS SIAGA 1KM²"
          pageTitle="Peta Prioritas Siaga 1 km² (Gradient Boosting & Permutation Importance)"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              Kalkulasi spasial multikriteria (`analysis/prioritas_siaga_model.py`): Cuaca (Open-Meteo), Historis (NASA FIRMS), Gambut, dan Aksesibilitas.
            </p>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileDown className="w-4 h-4 text-emerald-300" />
              <span>Unduh Matriks CSV Grid</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-2.5">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Peringkat Sel Grid Tertinggi (1 km²)
              </h3>

              <div className="space-y-2.5">
                {RISK_CELLS.map((cell) => {
                  const isSelected = selectedCell.id === cell.id;
                  return (
                    <div
                      key={cell.id}
                      onClick={() => setSelectedCell(cell)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-white border-[#0D2B1D] ring-2 ring-[#0D2B1D]/10 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold font-mono text-slate-900">
                          {cell.id}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            cell.score >= 80
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : cell.score >= 60
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          Skor {cell.score}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 font-bold truncate">{cell.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {cell.coordinates}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Inspeksi Sel Grid 1 km²
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {selectedCell.id}: {selectedCell.name}
                    </h2>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Koordinat Pusat: {selectedCell.coordinates}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Tingkat Siaga
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-red-600">
                      {selectedCell.score} / 100
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2">
                  <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>3 Faktor Pemicu Risiko Utama (Explainable AI):</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedCell.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <RiskFactorBars factors={selectedCell.factors} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
