"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import {
  Flame,
  MapPin,
  Compass,
  Clock,
  Droplets,
  CheckCircle2,
  Navigation,
  Send,
  ShieldAlert,
} from "lucide-react";

interface AlertPublicData {
  alert: {
    id: string;
    level: "warning" | "active";
    node_id: string;
    area_id: string;
    status: string;
    created_at: string;
    snapshot: {
      t50?: number;
      co_ppm?: number;
      rate?: number;
      eta?: number;
      direction?: string;
      ember_depth_cm?: number;
    };
  };
  node: {
    id: string;
    lat: number;
    lon: number;
    status: string;
  };
  area: {
    name: string;
  };
  recommended_actions: {
    water_liters: number;
    nozzle_depth_cm: number;
    direction: string;
    eta_hours: number;
  };
}

function PublicAlertTokenContent() {
  const params = useParams();
  const token = (params?.token as string) || "mock-token";

  const [data, setData] = useState<AlertPublicData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [actionKind, setActionKind] = useState<"injection" | "inspection" | "relocate">("injection");
  const [waterLiters, setWaterLiters] = useState<number>(600);
  const [depthCm, setDepthCm] = useState<number>(50);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlert() {
      try {
        const res = await fetch(`/api/public/alerts/${token}`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          if (json.data.alert.status !== "open") {
            setAcknowledged(true);
          }
        } else {
          setErrorMsg(json.error || "Tautan alert kedaluwarsa atau tidak valid.");
        }
      } catch (err) {
        setErrorMsg("Koneksi gagal ke server posko");
      } finally {
        setLoading(false);
      }
    }
    loadAlert();
  }, [token]);

  const handleAcknowledge = async () => {
    try {
      const res = await fetch(`/api/public/alerts/${token}/acknowledge`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setAcknowledged(true);
      }
    } catch {
      setAcknowledged(true);
    }
  };

  const handleRecordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/alerts/${token}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: actionKind,
          water_liters: Number(waterLiters),
          depth_cm: Number(depthCm),
          note,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess(true);
      }
    } catch (err) {
      setErrorMsg(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono text-stone-400">
        Memverifikasi token tautan darurat...
      </div>
    );
  }

  if (errorMsg && !data) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-red-800/60 p-6 rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-stone-50">Tautan Tidak Dapat Diakses</h2>
          <p className="text-xs text-stone-400 leading-relaxed">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const alert = data?.alert;
  const node = data?.node;
  const lat = node?.lat ?? -1.2345;
  const lon = node?.lon ?? 102.6789;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  return (
    <div className="min-h-screen bg-ink text-stone-100 selection:bg-ember selection:text-white pb-16">
      {/* Top Banner Mobile Header */}
      <header className="border-b border-line bg-surface px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div>
            <div className="text-xs font-bold text-stone-50 font-mono">PakuBara Satgas</div>
            <div className="text-xs text-stone-400">Instruksi Darurat Lapangan</div>
          </div>
        </div>

        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
          TOKEN VALID 24J
        </span>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Card Level Alert */}
        <div className="p-5 rounded-2xl bg-red-950/70 border border-red-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-red-600 text-white">
              BARA GAMBUT AKTIF
            </span>
            <span className="text-xs font-mono text-stone-400">
              {new Date(alert?.created_at || Date.now()).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-black text-stone-50 tracking-wide">
              TITIK {node?.id || "PK-04"}
            </h1>
            <p className="text-xs text-stone-300">
              {data?.area.name || "Blok B Hutan Gambut Lindung"}
            </p>
          </div>

          {/* Quick Google Maps CTA */}
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-stone-50 text-stone-950 font-bold text-xs tracking-wide hover:bg-stone-200 transition-all "
          >
            <Navigation className="w-4 h-4 text-accent" />
            <span>Buka Navigasi Google Maps ({lat}, {lon})</span>
          </a>
        </div>

        {/* Snapshot Parameter Fisika */}
        <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
          <h3 className="text-xs font-semibold text-stone-300">
            Parameter Termal & Gas Bawah Permukaan
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-ink border border-line">
              <span className="text-xs text-stone-400 block">Suhu Gambut 50cm</span>
              <span className="font-mono text-lg font-black text-red-400">
                {alert?.snapshot.t50 ?? 87.3}°C
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-ink border border-line">
              <span className="text-xs text-stone-400 block">Konsentrasi Gas CO</span>
              <span className="font-mono text-lg font-black text-orange-400">
                {alert?.snapshot.co_ppm ?? 185} ppm
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-ink border border-line">
              <span className="text-xs text-stone-400 block">Laju Pemanasan</span>
              <span className="font-mono text-base font-bold text-amber-400">
                +{alert?.snapshot.rate ?? 6.0}°C / jam
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-ink border border-line">
              <span className="text-xs text-stone-400 block">Prediksi Arah & ETA</span>
              <span className="font-mono text-xs font-bold text-stone-50 mt-1 block">
                {alert?.snapshot.direction ?? "Timur Laut (45°)"} (ETA {alert?.snapshot.eta ?? 11.9}j)
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Acknowledge (Saya Menuju Lokasi) */}
        {!acknowledged ? (
          <button
            onClick={handleAcknowledge}
            className="w-full py-3 rounded-xl bg-ember-strong hover:bg-ember-strong-hover text-white font-bold text-xs tracking-wide transition-all  flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi: Regu Saya Menuju Lokasi</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Alert telah diakui oleh regu lapangan</span>
          </div>
        )}

        {/* Formulir Catat Tindakan Pemadaman / Injeksi */}
        <div className="p-5 rounded-xl bg-surface border border-line space-y-4">
          <h3 className="text-xs font-semibold text-stone-50 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-orange-400" />
            Catat Tindakan Lapangan (Nozzle / Injeksi)
          </h3>

          {actionSuccess ? (
            <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 text-xs text-center space-y-1">
              <div className="font-bold">Tindakan Berhasil Disimpan di Sistem Posko</div>
              <p className="text-xs text-stone-400">
                Terima kasih atas respons cepat Anda. Data telemetri titik ini akan terus dipantau.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRecordAction} className="space-y-3 text-xs">
              <div>
                <label className="text-xs text-stone-400 block mb-1">
                  Jenis Tindakan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "injection", label: "Injeksi Air" },
                    { id: "inspection", label: "Inspeksi" },
                    { id: "relocate", label: "Relokasi" },
                  ].map((k) => (
                    <button
                      type="button"
                      key={k.id}
                      onClick={() => setActionKind(k.id as "injection" | "inspection" | "relocate")}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        actionKind === k.id
                          ? "bg-ember-strong text-white"
                          : "bg-ink text-stone-400 border border-line"
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Volume Air (Liter)
                  </label>
                  <input
                    type="number"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(Number(e.target.value))}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                  />
                </div>

                <div>
                  <label className="text-xs text-stone-400 block mb-1">
                    Kedalaman Nozzle (cm)
                  </label>
                  <input
                    type="number"
                    value={depthCm}
                    onChange={(e) => setDepthCm(Number(e.target.value))}
                    className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">
                  Catatan Lapangan & Kondisi Asap
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Misal: Injeksi pipa gambut kedalaman 50cm, asap putih mereda..."
                  className="w-full bg-ink border border-line rounded-lg p-2.5 text-stone-50 focus:outline-none focus:border-ember"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Simpan Laporan Tindakan</span>
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PublicAlertTokenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ink flex items-center justify-center text-xs font-mono text-stone-400">
          Memverifikasi token tautan darurat...
        </div>
      }
    >
      <PublicAlertTokenContent />
    </Suspense>
  );
}
