"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  Radio,
  Plus,
  Battery,
  Wifi,
  Clock,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface GatewayItem {
  id: string;
  name: string;
  mac_address: string;
  status: "online" | "offline";
  firmware_version: string;
  last_ping: string;
}

interface NodeItem {
  id: string;
  type: "probe" | "gas";
  status: string;
  batt_mv: number;
  rssi: number;
  last_seen: string;
  last_reading: {
    t20?: number;
    t50?: number;
    t100?: number;
    co?: number;
  };
}

export default function DevicesPage() {
  const [gateways, setGateways] = useState<GatewayItem[]>([]);
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddGateway, setShowAddGateway] = useState<boolean>(false);
  const [newGwName, setNewGwName] = useState<string>("");
  const [newGwMac, setNewGwMac] = useState<string>("");
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);

  const loadDevices = async () => {
    try {
      const [gwRes, nodesRes] = await Promise.all([
        fetch("/api/gateways"),
        fetch("/api/nodes"),
      ]);
      const gwJson = await gwRes.json();
      const nodesJson = await nodesRes.json();

      if (gwJson.success && Array.isArray(gwJson.data)) {
        setGateways(gwJson.data);
      }
      if (nodesJson.success && Array.isArray(nodesJson.data)) {
        setNodes(nodesJson.data);
      }
    } catch (err) {
      console.error("Gagal memuat perangkat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleRegisterGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/gateways", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area_id: "a0000000-0000-0000-0000-000000000001",
          name: newGwName,
          mac_address: newGwMac,
          firmware_version: "v1.2.0-esp32",
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.api_key) {
        setCreatedApiKey(json.data.api_key);
        loadDevices();
      }
    } catch (err) {
      console.error("Gagal mendaftarkan gateway:", err);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-stone-100 flex flex-col select-none">
      <AppNavbar />

      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <h1 className="text-xl font-bold font-mono text-stone-50 flex items-center gap-2">
                <Radio className="w-5 h-5 text-accent" />
                INVENTARIS PERANGKAT IOT & GATEWAY
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Manajemen paku termal, tiang gas CO, dan stasiun penerima LoRa posko lapangan.
              </p>
            </div>

            <button
              onClick={() => {
                setShowAddGateway(true);
                setCreatedApiKey(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white text-xs font-semibold  transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Gateway Baru</span>
            </button>
          </div>

          {/* Modal / Card Pendaftaran Gateway Baru */}
          {showAddGateway && (
            <div className="p-5 rounded-xl bg-surface border border-ember/60 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-stone-50 font-mono flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Registrasi Gateway Stasiun Posko
                </h3>
                <button
                  onClick={() => setShowAddGateway(false)}
                  className="text-xs text-stone-400 hover:text-stone-50"
                >
                  Tutup
                </button>
              </div>

              {createdApiKey ? (
                <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Gateway Berhasil Didaftarkan!</span>
                  </div>
                  <p className="text-xs text-stone-300">
                    Gunakan API Key berikut pada skrip Node.js Bridge atau firmware ESP32 posko. API Key ini tidak akan ditampilkan kembali:
                  </p>
                  <div className="p-2.5 rounded bg-black/60 font-mono text-amber-300 font-bold select-all break-all">
                    {createdApiKey}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterGateway} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">
                      Nama Posko / Lokasi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Posko Kanal Sekunder 2"
                      value={newGwName}
                      onChange={(e) => setNewGwName(e.target.value)}
                      className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 focus:outline-none focus:border-ember"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-stone-400 block mb-1">
                      MAC Address ESP32
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: A4:CF:12:88:9B:02"
                      value={newGwMac}
                      onChange={(e) => setNewGwMac(e.target.value)}
                      className="w-full bg-ink border border-line rounded-lg px-3 py-2 text-stone-50 font-mono focus:outline-none focus:border-ember"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-ember-strong hover:bg-ember-strong-hover text-white font-semibold text-xs transition-colors"
                    >
                      Simpan & Dapatkan API Key
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Section 1: Gateways */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-stone-400">
              Gateway LoRa Posko Lapangan ({gateways.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gateways.map((gw) => (
                <div key={gw.id} className="p-4 rounded-xl bg-surface border border-line space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-stone-50 font-mono">{gw.name}</div>
                      <div className="text-xs text-stone-400 font-mono">MAC: {gw.mac_address}</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      {gw.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-line">
                    <span>Firmware: {gw.firmware_version}</span>
                    <span className="font-mono">
                      Detak Terakhir: {new Date(gw.last_ping).toLocaleTimeString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Nodes Table */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-stone-400">
              Titik Sensor Paku & Tiang Gas ({nodes.length})
            </h2>

            <div className="overflow-x-auto rounded-xl border border-line bg-surface">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink text-stone-400 text-xs border-b border-line">
                  <tr>
                    <th className="p-3">ID Titik</th>
                    <th className="p-3">Tipe</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Suhu 50cm / CO</th>
                    <th className="p-3">Baterai</th>
                    <th className="p-3">Sinyal (RSSI)</th>
                    <th className="p-3">Terakhir Kirim</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {nodes.map((node) => {
                    const readingText =
                      node.type === "probe"
                        ? `${node.last_reading.t50 ?? "-"} °C`
                        : `${node.last_reading.co ?? "-"} ppm CO`;
                    const volt = ((node.batt_mv ?? 3800) / 1000).toFixed(2);

                    return (
                      <tr key={node.id} className="hover:bg-raised transition-colors">
                        <td className="p-3 font-mono font-bold text-stone-50">{node.id}</td>
                        <td className="p-3 text-stone-300">
                          {node.type === "probe" ? "Paku Termal" : "Tiang Gas"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-bold ${
                              node.status === "active"
                                ? "bg-red-950 text-red-400 border border-red-800"
                                : node.status === "watch"
                                ? "bg-amber-950 text-amber-400 border border-amber-800"
                                : node.status === "offline"
                                ? "bg-stone-800 text-stone-400"
                                : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            }`}
                          >
                            {node.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">{readingText}</td>
                        <td className="p-3 font-mono text-stone-300">{volt} V</td>
                        <td className="p-3 font-mono text-stone-400">{node.rssi} dBm</td>
                        <td className="p-3 font-mono text-stone-400">
                          {new Date(node.last_seen).toLocaleTimeString("id-ID")}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/app/nodes/${node.id}`}
                            className="text-accent hover:text-ember-hover font-medium font-mono text-xs inline-flex items-center gap-1"
                          >
                            <span>Detail</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

