"use client";

import React, { useState } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  Settings,
  Sliders,
  Key,
  Phone,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [tempThreshold, setTempThreshold] = useState<number>(60);
  const [rateThreshold, setRateThreshold] = useState<number>(5.0);
  const [coThreshold, setCoThreshold] = useState<number>(50);
  const [safeDaysReq, setSafeDaysReq] = useState<number>(3);
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
        body: JSON.stringify({ target_phone: testNumber }),
      });
      const json = await res.json();
      if (json.success) {
        setTestSuccess(json.message);
      } else {
        setTestSuccess(`Gagal: ${json.error}`);
      }
    } catch (err) {
      setTestSuccess(`Error: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-stone-100 flex flex-col select-none">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl">
          {/* Header */}
          <div className="border-b border-line pb-4">
            <h1 className="text-xl font-bold font-mono text-stone-50 flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" />
              PENGATURAN PARAMETER SISTEM
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Kalibrasi nilai ambang fisika bara, toleransi alarm fusi, dan konfigurasi integrasi WhatsApp.
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pengaturan parameter sistem berhasil diperbarui.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Ambang Fisika Bara Gambut */}
            <div className="p-5 rounded-xl bg-surface border border-line space-y-4">
              <h3 className="text-sm font-semibold text-stone-50 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent" />
                1. Ambang Batas Deteksi Fisika Bara
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Ambang Suhu Inti Bara 50 cm (°C)
                  </label>
                  <input
                    type="number"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(Number(e.target.value))}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Standar pirolisis gambut: 60°C memicu status Waspada/Bara Aktif.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Laju Kenaikan Suhu (°C / jam)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={rateThreshold}
                    onChange={(e) => setRateThreshold(Number(e.target.value))}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Regresi linear: laju di atas 5.0°C/jam menandakan pembakaran aktif.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Ambang Batas Gas Karbon Monoksida (ppm)
                  </label>
                  <input
                    type="number"
                    value={coThreshold}
                    onChange={(e) => setCoThreshold(Number(e.target.value))}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Sensor MQ-7: pembaraan anaerobik menghasilkan konsentrasi CO &gt; 50 ppm.
                  </p>
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Syarat Hari Stabil Kawasan Aman (Hari)
                  </label>
                  <input
                    type="number"
                    value={safeDaysReq}
                    onChange={(e) => setSafeDaysReq(Number(e.target.value))}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                  />
                  <p className="text-xs text-stone-400 mt-1">
                    Sesuai Permen LHK No. P.32/2016: wajib 3 hari berturut-turut stabil.
                  </p>
                </div>
              </div>
            </div>

            {/* Nomor Penerima Notifikasi WhatsApp */}
            <div className="p-5 rounded-xl bg-surface border border-line space-y-4">
              <h3 className="text-sm font-semibold text-stone-50 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                2. Penerima Alert WhatsApp Otomatis (Fonnte API)
              </h3>

              <div className="text-xs space-y-2">
                <label className="text-xs text-stone-400 block">
                  Daftar Nomor WhatsApp Satgas (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={phoneRecipients}
                  onChange={(e) => setPhoneRecipients(e.target.value)}
                  className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                />
                <p className="text-xs text-stone-400">
                  Gunakan format internasional tanpa tanda plus (misal: 6281234567890).
                </p>
              </div>

              {/* Uji Kirim Langsung */}
              <div className="pt-3 border-t border-line space-y-2 text-xs">
                <label className="text-xs text-stone-400 block">
                  Uji Kirim Pesan Alert Lapangan
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ketik nomor uji (contoh: 62812xxxxxxxx)"
                    value={testNumber}
                    onChange={(e) => setTestNumber(e.target.value)}
                    className="flex-1 bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono text-xs focus:outline-none focus:border-ember"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestWa}
                    disabled={testing}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Uji</span>
                  </button>
                </div>
                {testSuccess && (
                  <div className="p-2 rounded bg-ink text-xs text-emerald-300 font-mono">
                    {testSuccess}
                  </div>
                )}
              </div>
            </div>

            {/* Simpan Perubahan */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white text-xs font-bold  transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Konfigurasi</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

