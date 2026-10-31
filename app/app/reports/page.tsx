"use client";

import React, { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  FileText,
  FileDown,
  Droplets,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ActionRecord {
  id: string;
  alert_id?: string | null;
  node_id?: string | null;
  kind: "injection" | "inspection" | "relocate" | "other";
  water_liters?: number | null;
  depth_cm?: number | null;
  note?: string | null;
  created_at: string;
}

export default function ReportsPage() {
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadActions() {
      try {
        const res = await fetch("/api/actions");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setActions(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat catatan tindakan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActions();
  }, []);

  return (
    <div className="min-h-screen bg-[#121010] text-[#F3F4F6] flex flex-col select-none">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2D2424] pb-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#EA580C]" />
                LAPORAN AUDIT & RIWAYAT PENANGGULANGAN
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Rekam jejak tindakan lapangan untuk kepatuhan Permen LHK No. P.32/2016 dan audit konsesi.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/api/reports/actions.csv"
                download
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#181414] hover:bg-[#261E1E] border border-[#2D2424] text-neutral-200 text-xs font-semibold transition-colors"
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span>Unduh CSV Tindakan</span>
              </a>

              <a
                href="/api/reports/areas/a0000000-0000-0000-0000-000000000001/pdf"
                download
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EA580C] hover:bg-[#F97316] text-white text-xs font-semibold shadow-md transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Cetak PDF Audit Resmi</span>
              </a>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#181414] border border-[#2D2424]">
              <div className="text-[10px] text-neutral-400 font-mono uppercase">
                Total Intervensi Tercatat
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {actions.length} Tindakan
              </div>
              <div className="text-[10px] text-neutral-500 mt-0.5">Semua terdokumentasi dengan stempel waktu</div>
            </div>

            <div className="p-4 rounded-xl bg-[#181414] border border-[#2D2424]">
              <div className="text-[10px] text-neutral-400 font-mono uppercase">
                Total Air Gambut Disuntikkan
              </div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
                {actions.reduce((acc, a) => acc + (a.water_liters || 0), 0)} Liter
              </div>
              <div className="text-[10px] text-sky-400/80 mt-0.5">Kedalaman target rata-rata 50 cm</div>
            </div>

            <div className="p-4 rounded-xl bg-[#181414] border border-[#2D2424]">
              <div className="text-[10px] text-neutral-400 font-mono uppercase">
                Kepatuhan Standar KLHK
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                100% Sesuai
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">Memenuhi Permen LHK P.32/2016</div>
            </div>
          </div>

          {/* Actions Log Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              Buku Log Intervensi Tim Posko Lapangan
            </h2>

            <div className="overflow-x-auto rounded-xl border border-[#2D2424] bg-[#181414]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121010] text-neutral-400 font-mono text-[10px] uppercase border-b border-[#2D2424]">
                  <tr>
                    <th className="p-3">Waktu Kejadian</th>
                    <th className="p-3">ID Titik</th>
                    <th className="p-3">Jenis Intervensi</th>
                    <th className="p-3">Volume Air</th>
                    <th className="p-3">Kedalaman Nozzle</th>
                    <th className="p-3">Catatan Satgas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#261E1E]">
                  {actions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-neutral-500 font-mono">
                        Belum ada riwayat tindakan yang dicatat.
                      </td>
                    </tr>
                  ) : (
                    actions.map((act) => (
                      <tr key={act.id} className="hover:bg-[#1C1616] transition-colors">
                        <td className="p-3 font-mono text-neutral-300">
                          {new Date(act.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          {act.node_id || "PK-04"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              act.kind === "injection"
                                ? "bg-sky-950 text-sky-400 border border-sky-800"
                                : "bg-neutral-800 text-neutral-300"
                            }`}
                          >
                            {act.kind === "injection" ? "Injeksi Nozzle" : act.kind}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-sky-300">
                          {act.water_liters ? `${act.water_liters} L` : "-"}
                        </td>
                        <td className="p-3 font-mono text-amber-400">
                          {act.depth_cm ? `${act.depth_cm} cm` : "-"}
                        </td>
                        <td className="p-3 text-neutral-300 max-w-xs truncate">
                          {act.note || "Tidak ada catatan."}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

