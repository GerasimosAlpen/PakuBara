"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Sliders, Phone, Save, Send, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [tempThreshold, setTempThreshold] = useState<number>(450);
  const [rateThreshold, setRateThreshold] = useState<number>(5.0);
  const [coThreshold, setCoThreshold] = useState<number>(100);
  const [safeHoursReq, setSafeHoursReq] = useState<number>(72);
  const [phoneRecipients, setPhoneRecipients] = useState<string>("6281234567890, 6289876543210");
  const [testNumber, setTestNumber] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [testing, setTesting] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestWa = async () => {
    if (!testNumber) return;
    setTesting(true);
    setTestSuccess(null);
    try {
      const res = await fetch("/api/alerts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: testNumber, target_phone: testNumber }),
      });
      const json = await res.json();
      if (json.success) {
        setTestSuccess(`✓ Pesan WhatsApp terkirim ke ${testNumber}! Detail: ${json.provider_response?.detail || "Terkirim"}`);
      } else {
        setTestSuccess(`Gagal: ${json.error || JSON.stringify(json.provider_response)}`);
      }
    } catch (err) {
      setTestSuccess(`Error: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          breadcrumb="ANALITIK & REGULASI / PARAMETER SISTEM"
          pageTitle="Kalibrasi Ambang Fisika Bara & Konfigurasi Notifikasi WhatsApp"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 max-w-4xl">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pengaturan parameter sistem berhasil diperbarui.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <span>1. Ambang Batas Deteksi Fisika Bara Gambut</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Ambang Bara Kritis Kedalaman 50 cm (°C)
                  </label>
                  <input
                    type="number"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Laju Kenaikan Suhu (°C / jam)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rateThreshold}
                    onChange={(e) => setRateThreshold(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Ambang Bahaya Smouldering Gas CO (ppm)
                  </label>
                  <input
                    type="number"
                    value={coThreshold}
                    onChange={(e) => setCoThreshold(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                    Durasi Protokol Verifikasi Lahan Aman (Jam)
                  </label>
                  <input
                    type="number"
                    value={safeHoursReq}
                    onChange={(e) => setSafeHoursReq(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>2. Penerima Alert WhatsApp Otomatis (Fonnte API)</span>
              </h3>

              <div className="text-xs space-y-1.5">
                <label className="text-[11px] text-slate-600 font-semibold block">
                  Daftar Nomor WhatsApp Regu Manggala Agni &amp; MPA
                </label>
                <input
                  type="text"
                  value={phoneRecipients}
                  onChange={(e) => setPhoneRecipients(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <label className="text-[11px] text-slate-600 font-semibold block">
                  Uji Kirim Pesan Alert Lapangan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik nomor uji (contoh: 62812xxxxxxxx)"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="flex-1 bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-700"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestWa}
                    disabled={testing}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Uji</span>
                  </button>
                </div>
                {testSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono">
                    {testSuccess}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Save className="w-4 h-4 text-emerald-300" />
                <span>Simpan Konfigurasi</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
