"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  Flame,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ShieldAlert,
  Search,
  Filter,
} from "lucide-react";

interface AlertItem {
  id: string;
  node_id: string;
  area_id: string;
  level: "warning" | "active";
  signals: {
    temp_trend: boolean;
    neighbor: boolean;
    co: boolean;
  };
  snapshot: {
    t50?: number;
    co_ppm?: number;
    rate?: number;
    eta?: number;
    direction?: string;
    ember_depth_cm?: number;
  };
  status: "open" | "acknowledged" | "in_progress" | "resolved" | "false_alarm";
  created_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
}

export default function AlertsCenterPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState<string>("");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      const url = filterStatus === "all" ? "/api/alerts" : `/api/alerts?status=${filterStatus}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAlerts(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat alert:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [filterStatus]);

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        loadAlerts();
      }
    } catch (err) {
      console.error("Gagal acknowledge alert:", err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          resolution_note: resolveNote || "Injeksi air gambut selesai, suhu telah turun normal.",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResolvingId(null);
        setResolveNote("");
        setSuccessBanner(`Alert ${id.slice(0, 8)} berhasil diselesaikan! Notifikasi WhatsApp "Penanganan Selesai & Titik Stabil" telah otomatis dikirimkan ke Satgas.`);
        setTimeout(() => setSuccessBanner(null), 6000);
        loadAlerts();
      }
    } catch (err) {
      console.error("Gagal resolve alert:", err);
    }
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
                <Flame className="w-5 h-5 text-red-500" />
                PUSAT PERINGATAN DINI BARA
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Daftar peringatan hasil fusi multi-sensor dengan verifikasi 2 dari 3 sinyal.
              </p>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-line text-xs">
              {[
                { id: "all", label: "Semua" },
                { id: "open", label: "Terbuka" },
                { id: "acknowledged", label: "Diakui" },
                { id: "resolved", label: "Selesai" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filterStatus === tab.id
                      ? "bg-ember-strong text-white"
                      : "text-stone-400 hover:text-stone-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifikasi Penyelesaian */}
          {successBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {/* Alert Cards */}
          {loading ? (
            <div className="text-xs font-mono text-stone-400 text-center py-12">
              Memuat data peringatan...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-surface border border-line space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="text-sm font-semibold text-stone-50">Tidak Ada Peringatan Ditemukan</div>
              <p className="text-xs text-stone-400">
                Semua titik sensor berada dalam batas normal atau telah diselesaikan.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-5 rounded-xl border transition-all ${
                    al.status === "open"
                      ? "bg-raised border-red-800/60  "
                      : "bg-surface border-line"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                          al.level === "active" ? "bg-red-600 text-white" : "bg-amber-600 text-white"
                        }`}
                      >
                        {al.level === "active" ? "Bara Aktif" : "Waspada"}
                      </span>
                      <span className="text-sm font-bold font-mono text-stone-50">
                        Node {al.node_id}
                      </span>
                      <span className="text-xs text-stone-400">
                        ({al.id.slice(0, 8)}...)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(al.created_at).toLocaleString("id-ID")}</span>
                      <span className="px-2 py-0.5 rounded bg-raised text-stone-300 font-semibold">
                        {al.status}
                      </span>
                    </div>
                  </div>

                  {/* Fusi 3 Sinyal Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
                    <span className="text-xs text-stone-400 font-sans">
                      Validasi Sinyal:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        al.signals.temp_trend
                          ? "bg-red-950/60 border-red-700 text-red-300"
                          : "bg-stone-900 border-stone-800 text-stone-400"
                      }`}
                    >
                      S1: Laju Suhu {al.signals.temp_trend ? "(Lolos)" : "(Gagal)"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        al.signals.neighbor
                          ? "bg-amber-950/60 border-amber-700 text-amber-300"
                          : "bg-stone-900 border-stone-800 text-stone-400"
                      }`}
                    >
                      S2: Korelasi Tetangga {al.signals.neighbor ? "(Lolos)" : "(Gagal)"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border ${
                        al.signals.co
                          ? "bg-orange-950/60 border-orange-700 text-orange-300"
                          : "bg-stone-900 border-stone-800 text-stone-400"
                      }`}
                    >
                      S3: Sensor Gas CO {al.signals.co ? "(Lolos)" : "(Gagal)"}
                    </span>
                  </div>

                  {/* Parameter Snapshot Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-ink p-3 rounded-lg border border-line mb-4">
                    <div>
                      <span className="text-xs text-stone-400 block">Suhu Gambut 50cm</span>
                      <span className="font-mono font-bold text-red-400">
                        {al.snapshot.t50 ?? "-"}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Konsentrasi CO</span>
                      <span className="font-mono font-bold text-orange-400">
                        {al.snapshot.co_ppm ?? "-"} ppm
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Laju Pemanasan</span>
                      <span className="font-mono font-bold text-amber-400">
                        +{al.snapshot.rate ?? "-"}°C/j
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-stone-400 block">Prediksi Arah & ETA</span>
                      <span className="font-mono font-bold text-stone-50">
                        {al.snapshot.direction ?? "TL (45°)"} (ETA {al.snapshot.eta ?? "-"}j)
                      </span>
                    </div>
                  </div>

                  {/* Actions & Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/app/nodes/${al.node_id}`}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                      >
                        <span>Lihat Grafik Titik</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        href={`/a/mock-token-sample`}
                        target="_blank"
                        className="text-xs text-stone-400 hover:text-stone-50 font-medium flex items-center gap-1 pl-3 border-l border-line"
                      >
                        <span>Tautan WhatsApp Petugas</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      {al.status === "open" && (
                        <button
                          onClick={() => handleAcknowledge(al.id)}
                          className="px-3 py-1.5 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white text-xs font-semibold transition-colors"
                        >
                          Akui Alert (Acknowledge)
                        </button>
                      )}

                      {al.status !== "resolved" && (
                        <button
                          onClick={() => setResolvingId(al.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          Tandai Selesai (Resolve)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modal / Inline form to resolve */}
                  {resolvingId === al.id && (
                    <div className="mt-4 p-4 rounded-lg bg-raised border border-emerald-700/60 space-y-3">
                      <div className="text-xs font-bold text-emerald-300">
                        Konfirmasi Penyelesaian Alert {al.id.slice(0, 8)}
                      </div>
                      <input
                        type="text"
                        placeholder="Catatan penyelesaian (misal: Injeksi pipa nozzle 600L selesai, bara padam)"
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-xs text-stone-50 focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setResolvingId(null)}
                          className="px-3 py-1 text-xs rounded bg-raised text-stone-400 hover:text-stone-50"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleResolve(al.id)}
                          className="px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Simpan Status Selesai
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
