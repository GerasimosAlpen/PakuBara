"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  Radio,
  Plus,
  Key,
  CheckCircle2,
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
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 flex select-none">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppNavbar
          breadcrumb="PUSAT OPERASI / PENGATURAN NODE LORA"
          pageTitle="Inventaris Perangkat IoT & Stasiun Gateway LoRaWAN"
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              Manajemen probe paku termal DS18B20, tiang gas CO MQ-7, dan gateway penerima LoRa posko lapangan.
            </p>

            <button
              onClick={() => {
                setShowAddGateway(true);
                setCreatedApiKey(null);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Daftarkan Gateway Posko Baru</span>
            </button>
          </div>

          {showAddGateway && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  Registrasi Gateway Stasiun Posko
                </h3>
                <button
                  onClick={() => setShowAddGateway(false)}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Tutup
                </button>
              </div>

              {createdApiKey ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Gateway Berhasil Didaftarkan</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Gunakan API Key berikut pada skrip Node.js Serial Bridge (`bridge/serial-bridge.js`):
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-emerald-200 font-mono text-slate-900 font-bold select-all break-all">
                    {createdApiKey}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegisterGateway} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                      Nama Posko / Lokasi
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Posko Kanal Sekunder 2"
                      value={newGwName}
                      onChange={(e) => setNewGwName(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                      MAC Address ESP32
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: A4:CF:12:88:9B:02"
                      value={newGwMac}
                      onChange={(e) => setNewGwMac(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-700"
                    />
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#0D2B1D] hover:bg-[#143d29] text-white font-bold text-xs transition-colors"
                    >
                      Simpan &amp; Buat API Key
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Gateways Grid */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Gateway LoRa Posko Lapangan ({gateways.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gateways.map((gw) => (
                <div
                  key={gw.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">{gw.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          MAC: {gw.mac_address}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase">
                      {gw.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Firmware: {gw.firmware_version}</span>
                    <span className="font-mono">
                      Ping: {new Date(gw.last_ping).toLocaleTimeString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nodes Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900">
              Titik Sensor Paku &amp; Tiang Gas CO ({nodes.length} Node Terdaftar)
            </h2>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">ID Titik</th>
                    <th className="p-3">Tipe Sensor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Suhu 50cm / CO</th>
                    <th className="p-3">Baterai</th>
                    <th className="p-3">Sinyal (RSSI)</th>
                    <th className="p-3">Terakhir Kirim</th>
                    <th className="p-3 text-right">Diagnostik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {nodes.map((node) => {
                    const readingText =
                      node.type === "probe"
                        ? `${node.last_reading.t50 ?? "-"} °C`
                        : `${node.last_reading.co ?? "-"} ppm CO`;
                    const volt = ((node.batt_mv ?? 3800) / 1000).toFixed(2);

                    return (
                      <tr key={node.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-extrabold text-slate-900">{node.id}</td>
                        <td className="p-3 text-slate-600 font-medium">
                          {node.type === "probe"
                            ? "Paku Probe SUS 304 (DS18B20)"
                            : "Tiang Gas CO (MQ-7)"}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              node.status === "active"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : node.status === "watch"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : node.status === "offline"
                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            }`}
                          >
                            {node.status === "active" ? "BARA AKTIF" : node.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">{readingText}</td>
                        <td className="p-3 font-mono text-slate-600">{volt} V</td>
                        <td className="p-3 font-mono text-slate-600">{node.rssi} dBm</td>
                        <td className="p-3 font-mono text-slate-500">
                          {new Date(node.last_seen).toLocaleTimeString("id-ID")}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/app/nodes/${node.id}`}
                            className="text-emerald-800 hover:underline font-bold text-xs inline-flex items-center gap-1"
                          >
                            <span>Buka</span>
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
