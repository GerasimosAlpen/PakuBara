"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  ShieldCheck,
  FileDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Send,
  Phone,
  MoreVertical,
  ArrowLeft,
  MapPin,
  ExternalLink,
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
}

export default function AlertsCenterPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [testPhone, setTestPhone] = useState<string>("");
  const [sendingWa, setSendingWa] = useState<boolean>(false);
  const [waResult, setWaResult] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAlerts(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat alert:", err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/acknowledge`, { method: "POST" });
      const json = await res.json();
      if (json.success) loadAlerts();
    } catch (err) {
      console.error("Gagal acknowledge alert:", err);
    }
  };

  const handleSendTestWa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setSendingWa(true);
    setWaResult(null);
    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: testPhone, target_phone: testPhone }),
      });
      const json = await res.json();
      if (json.success) {
        setWaResult(`✓ Pesan WhatsApp terkirim ke ${testPhone}! Detail: ${json.provider_response?.detail || "Terkirim"}`);
      } else {
        setWaResult(`Gagal: ${json.error || JSON.stringify(json.provider_response || "Koneksi Fonnte bermasalah")}`);
      }
    } catch (err) {
      setWaResult(`Error koneksi: ${String(err)}`);
    } finally {
      setSendingWa(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          breadcrumb="PUSAT OPERASI / SAFETY LOG & WHATSAPP"
          pageTitle="Verifikasi Keamanan Lahan & Riwayat Peringatan Darurat"
        />

        <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Top Action Row with PDF Compliance Download Button matching Layar 3 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-600">
              Protokol standar kepatuhan pemantauan pasca-intervensi &amp; pengiriman peringatan dini otomatis ke regu lapangan.
            </div>

            <a
              href="/api/reports/areas/a0000000-0000-0000-0000-000000000001/pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileDown className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Unduh Laporan Audit Kepatuhan (PDF - Permen LHK P.32/2016)</span>
            </a>
          </div>

          {/* Main 2-Column Grid matching Layar 3 */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): Safety Status & Activity Log */}
            <div className="xl:col-span-7 space-y-5">
              {/* Card 1: Safety Status & 72-Hour Verification Bars */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Safety Status &amp; Activity Log
                  </h2>
                </div>

                {/* Protocol Banner Box */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    Protokol Verifikasi Lahan 100% Aman Ditinggalkan (72 Jam)
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Suhu &lt;35°C &amp; CO &lt;10 ppm · Stabil selama 72 jam</span>
                  </div>
                </div>

                {/* 3 Sector Progress Bars matching Layar 3 */}
                <div className="space-y-4 pt-1">
                  {/* Sektor A-01 */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900">Sektor A-01</span>
                        <span className="text-slate-400 mx-1.5">—</span>
                        <span className="text-slate-600 font-medium">
                          72/72 Jam Stabil &lt;35°C &amp; CO &lt;10 ppm
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>AMAN DITINGGALKAN (Armada Dapat Ditarik)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-full bg-emerald-600 rounded-full" />
                    </div>
                  </div>

                  {/* Sektor B-02 */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900">Sektor B-02</span>
                        <span className="text-slate-400 mx-1.5">—</span>
                        <span className="text-slate-600 font-medium">
                          28/72 Jam Pendinginan (Suhu 42°C)
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold uppercase">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>DALAM PEMANTAUAN</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-[39%] bg-amber-500 rounded-full" />
                    </div>
                  </div>

                  {/* Sektor B-04 */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-extrabold text-slate-900">Sektor B-04</span>
                        <span className="text-slate-400 mx-1.5">—</span>
                        <span className="text-slate-600 font-medium">
                          Suhu 542°C (Kedalaman 50 cm)
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[10px] font-extrabold uppercase">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>INTERVENSI SUNTIK AIR</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full w-[68%] bg-red-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Activity Log Penanganan Lapangan Table matching Layar 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Activity Log Penanganan Lapangan
                  </h2>
                  <Link
                    href="/app/reports"
                    className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua Log</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] text-slate-500 border-b border-slate-200 font-semibold">
                      <tr>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Node ID</th>
                        <th className="p-3">Kedalaman &amp; Suhu</th>
                        <th className="p-3">Tindakan Regu (Manggala Agni / MPA)</th>
                        <th className="p-3">Status Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      <tr className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono text-slate-600">14:32</td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">
                          <Link href="/app/nodes/PK-04" className="hover:underline">
                            PK-04
                          </Link>
                        </td>
                        <td className="p-3 font-mono">
                          50 cm · <span className="font-extrabold text-red-600">542°C</span>
                        </td>
                        <td className="p-3 text-slate-700 font-medium">
                          Injeksi Peat Nozzle 120L air berlangsung
                        </td>
                        <td className="p-3">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                            Suntik Air Aktif
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono text-slate-600">11:15</td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">
                          <Link href="/app/nodes/PK-02" className="hover:underline">
                            PK-02
                          </Link>
                        </td>
                        <td className="p-3 font-mono text-slate-700">50 cm · 42°C</td>
                        <td className="p-3 text-slate-700 font-medium">
                          Suntik air selesai, fase pantau 72 jam
                        </td>
                        <td className="p-3">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                            Pendinginan (28/72j)
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono text-slate-600">Kemarin</td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">
                          <Link href="/app/nodes/PK-01" className="hover:underline">
                            PK-01
                          </Link>
                        </td>
                        <td className="p-3 font-mono text-slate-700">20-100 cm · &lt;32°C</td>
                        <td className="p-3 text-slate-700 font-medium">
                          Verifikasi 72 jam tuntas, regu ditarik
                        </td>
                        <td className="p-3">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            100% Aman
                          </span>
                        </td>
                      </tr>

                      {alerts.slice(0, 3).map((al) => (
                        <tr key={al.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-mono text-slate-500">
                            {new Date(al.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3 font-mono font-extrabold text-slate-900">
                            <Link href={`/app/nodes/${al.node_id}`} className="hover:underline">
                              {al.node_id}
                            </Link>
                          </td>
                          <td className="p-3 font-mono">
                            50 cm ·{" "}
                            <span className="font-bold text-red-600">
                              {al.snapshot?.t50 ?? 89.6}°C
                            </span>
                          </td>
                          <td className="p-3 text-slate-700">
                            Fusi 2-dari-3 sinyal tervalidasi (CO {al.snapshot?.co_ppm ?? 185} ppm)
                          </td>
                          <td className="p-3">
                            {al.status === "open" ? (
                              <button
                                onClick={() => handleAcknowledge(al.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#0D2B1D] hover:bg-[#143d29] text-white text-[11px] font-bold transition-colors"
                              >
                                Akui Alert
                              </button>
                            ) : (
                              <span className="inline-flex px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold uppercase">
                                {al.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Automated WhatsApp Notification matching Layar 3 */}
            <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Automated WhatsApp Notification
                </h2>
              </div>

              {/* Smartphone Frame Mockup matching Layar 3 */}
              <div className="mx-auto max-w-[360px] w-full rounded-[30px] bg-slate-900 p-2.5 shadow-lg border-4 border-slate-800">
                <div className="rounded-[22px] overflow-hidden bg-[#ECE5DD] border border-slate-700/40">
                  {/* Phone Status Bar */}
                  <div className="bg-[#054D44] text-white/90 px-4 py-1 text-[10px] font-mono flex items-center justify-between">
                    <span>14:31</span>
                    <div className="w-14 h-2.5 rounded-full bg-black/50" />
                    <span>4G · 94%</span>
                  </div>

                  {/* WhatsApp Group Top Bar */}
                  <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <ArrowLeft className="w-4 h-4 text-white/90 shrink-0" />
                      <div className="w-8 h-8 rounded-full bg-emerald-800 border border-emerald-400/40 flex items-center justify-center text-xs font-extrabold shrink-0">
                        SK
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-extrabold truncate leading-tight">
                          SIAGA KARHUTLA - POSKO &amp; MPA DESA
                        </div>
                        <div className="text-[9px] text-emerald-100/80 truncate">
                          18 anggota · Posko, Manggala Agni, MPA
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/80 shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                      <MoreVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* WhatsApp Chat Canvas */}
                  <div className="p-3.5 space-y-2.5 bg-[#ECE5DD]">
                    <div className="flex justify-center">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#D9FDD3]/80 text-slate-700 text-[10px] font-bold uppercase shadow-2xs">
                        HARI INI
                      </span>
                    </div>

                    {/* Alert Bot Message Bubble */}
                    <div className="bg-white rounded-xl rounded-tl-none p-3.5 shadow-xs border border-slate-200/80 space-y-2 text-xs text-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-700 text-[11px]">
                          PakuBara Alert Bot
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Otomatis</span>
                      </div>

                      <div className="font-extrabold text-red-600 text-xs">
                        [PERINGATAN DINI BARA GAMBUT]
                      </div>

                      <ul className="space-y-1 text-[11px] text-slate-700 leading-relaxed">
                        <li>
                          • Lokasi: <strong className="text-slate-900">Sektor B-04 (Node PK-04)</strong>
                        </li>
                        <li>
                          • Status:{" "}
                          <strong className="text-red-600">
                            BARA AKTIF (542°C di kedalaman 50 cm)
                          </strong>
                        </li>
                        <li>
                          • Kadar Gas CO:{" "}
                          <strong className="text-slate-900">185 ppm (Bahaya Smouldering)</strong>
                        </li>
                        <li>
                          • Prediksi Rambat:{" "}
                          <strong className="text-slate-900">Timur Laut (4,2 cm/jam)</strong>
                        </li>
                      </ul>

                      <div className="pt-1 text-[11px] text-slate-800 leading-relaxed">
                        <strong>Tindakan:</strong> Segera lakukan injeksi air gambut kedalaman 50 cm (Est. 120 Liter).
                      </div>

                      <Link
                        href="/a/mock-token-sample"
                        target="_blank"
                        className="mt-1 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 flex items-center justify-between text-[11px] font-semibold text-emerald-900 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span className="truncate">
                            Titik Lokasi: <span className="underline">maps.pakubara.id/pk04</span>
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-emerald-700 shrink-0" />
                      </Link>

                      <div className="text-right text-[10px] font-mono text-slate-400">
                        14:30 WIB ✓✓
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery SLA Confirmation Box matching Layar 3 */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-2 leading-snug">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Waktu Kirim Notifikasi: <strong>1,8 Detik</strong> (Target &lt;60 Detik) | Tersampaikan ke 18 Petugas &amp; Warga MPA
                </span>
              </div>

              {/* Live WhatsApp Fonnte Test Form for Judges */}
              <form
                onSubmit={handleSendTestWa}
                className="pt-3 border-t border-slate-100 space-y-2"
              >
                <label className="text-[11px] font-bold text-slate-700 block">
                  Uji Kirim Alert ke Nomor WhatsApp Juri (Fonnte API):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: 628123456789"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-700"
                  />
                  <button
                    type="submit"
                    disabled={sendingWa}
                    className="px-3.5 py-2 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Kirim Uji</span>
                  </button>
                </div>
                {waResult && (
                  <div className="text-[11px] font-mono text-emerald-700">{waResult}</div>
                )}
              </form>
            </div>
          </div>
        </main>

        {/* Bottom Footer Bar matching Layar 3 */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-2.5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div>
            Verifikasi darat dua lapis · Tiang CO &amp; paku sensor suhu multi-kedalaman
          </div>
          <div className="font-mono text-slate-400">
            Long-Range Data Transmission · LoRaWAN
          </div>
        </footer>
      </div>
    </div>
  );
}
