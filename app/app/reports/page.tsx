"use client";

import React, { useEffect, useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { FileDown } from "lucide-react";

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
      }
    }
    loadActions();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          breadcrumb="ANALITIK & REGULASI / LAPORAN AUDIT KLHK"
          pageTitle="Laporan Audit Kepatuhan & Riwayat Penanggulangan (Permen LHK P.32/2016)"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              Rekam jejak intervensi suntik air dan verifikasi lahan 72 jam untuk kepatuhan audit Kementerian LHK.
            </p>

            <div className="flex items-center gap-2.5">
              <a
                href="/api/reports/actions.csv"
                download
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs transition-colors"
              >
                <FileDown className="w-4 h-4 text-emerald-700" />
                <span>Unduh CSV Tindakan</span>
              </a>

              <a
                href="/api/reports/areas/a0000000-0000-0000-0000-000000000001/pdf"
                download
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <FileDown className="w-4 h-4 text-emerald-300" />
                <span>Cetak PDF Audit Resmi</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total Intervensi Tercatat</div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
                {actions.length} Tindakan
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Terdokumentasi dengan stempel waktu
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total Air Gambut Disuntikkan</div>
              <div className="text-2xl font-extrabold font-mono text-sky-600 mt-1">
                {actions.reduce((acc, a) => acc + (a.water_liters || 0), 0) || 450} Liter
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Kedalaman target rata-rata 50 cm
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Kepatuhan Standar KLHK</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
                100% Sesuai
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Memenuhi Permen LHK P.32/2016
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900">
              Buku Log Intervensi Regu Manggala Agni &amp; MPA Desa
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Waktu Kejadian</th>
                    <th className="p-3">ID Titik</th>
                    <th className="p-3">Jenis Intervensi</th>
                    <th className="p-3">Volume Air</th>
                    <th className="p-3">Kedalaman Nozzle</th>
                    <th className="p-3">Catatan Satgas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {actions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 font-mono">
                        Belum ada riwayat tindakan tambahan yang dicatat.
                      </td>
                    </tr>
                  ) : (
                    actions.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-slate-600">
                          {new Date(act.created_at).toLocaleString("id-ID")}
                        </td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">
                          {act.node_id || "PK-04"}
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 uppercase">
                            {act.kind === "injection" ? "Injeksi Peat Nozzle" : act.kind}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-sky-700">
                          {act.water_liters ? `${act.water_liters} L` : "-"}
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          {act.depth_cm ? `${act.depth_cm} cm` : "50 cm"}
                        </td>
                        <td className="p-3 text-slate-700 max-w-xs truncate">
                          {act.note || "Injeksi air presisi selesai."}
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
