import { NextRequest, NextResponse } from "next/server";
import {
  formatResolvedMessage,
  sendWhatsAppMessage,
} from "@/lib/integrations/fonnte";
import { generateAlertToken } from "@/lib/alerts/token";
import { mockStore } from "@/lib/mock-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const target =
      body.target ||
      body.target_phone ||
      body.phone ||
      body.targetNumber ||
      process.env.FONNTE_DEFAULT_TARGET ||
      "";
    const testType = body.type || body.kind || "emergency";

    // 1. Ambil alert aktif dari sistem (default PK-04 di Blok B Pulau Padang)
    const activeAlert =
      mockStore.alerts.find((a) => a.level === "active" && a.status === "open") ||
      mockStore.alerts[0] || {
        id: "b1c7e6e2-0000-0000-0000-000000000001",
        node_id: "PK-04",
        org_id: "d0000000-0000-0000-0000-000000000001",
        area_id: "a0000000-0000-0000-0000-000000000001",
        level: "active",
        signals: { temp_trend: true, neighbor: true, co: true },
        snapshot: {
          t50: 87.3,
          co_ppm: 185,
          rate: 6.0,
          eta: 11.9,
          direction: "Timur Laut (45°)",
          ember_depth_cm: 50,
        },
        status: "open",
        created_at: new Date().toISOString(),
      };

    const targetNode =
      mockStore.nodes.find((n) => n.id === activeAlert.node_id) || {
        id: "PK-04",
        lat: -1.2345,
        lon: 102.6789,
        status: "active",
      };

    const targetArea =
      mockStore.areas.find((a) => a.id === activeAlert.area_id) || {
        name: "KHG Pulau Padang (Blok B - Sektor Rawan III)",
      };

    // JIKA UJI COBA PESAN SELESAI / STABIL
    if (testType === "resolved") {
      const message =
        body.message || formatResolvedMessage(targetNode.id, targetArea.name);

      const result = await sendWhatsAppMessage(target, message);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error:
              (result.providerResponse as any)?.reason ||
              (result.providerResponse as any)?.message ||
              "Gagal mengirim pesan WhatsApp via Fonnte API",
            details: result,
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Pesan penanganan selesai & titik stabil berhasil dikirim ke WhatsApp!",
        data: {
          recipient: target,
          type: "resolved",
          node_id: targetNode.id,
          area: targetArea.name,
          message_preview: message,
          fonnte_response: result.providerResponse,
        },
      });
    }

    // 2. Generate token Signed JWT valid 24 jam untuk alert ini
    const token = await generateAlertToken({
      alert_id: activeAlert.id,
      node_id: targetNode.id,
      org_id: activeAlert.org_id || "d0000000-0000-0000-0000-000000000001",
    });

    // 3. Resolusi URL aplikasi (mendukung local dev, preview Vercel, maupun domain produksi)
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (host ? `${proto}://${host}` : "https://pakubara.vercel.app");
    const alertLink = `${appUrl}/a/${token}`;

    const timeStr = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "medium",
      timeStyle: "medium",
    });

    const snapshot = (activeAlert.snapshot as Record<string, any>) || {};
    const depthCm = snapshot.ember_depth_cm || 50;
    const tempC = (snapshot.t50 || 87.3).toFixed(1);
    const rateC = (snapshot.rate || 6.0).toFixed(1);
    const coPpm = snapshot.co_ppm || 185;
    const direction = snapshot.direction || "Timur Laut (45°)";
    const etaHours = snapshot.eta || 11.9;

    // 4. Susun pesan darurat production-ready standar operasional PakuBara
    const message =
      body.message ||
      [
        `🚨 *PAKUBARA | SISTEM PERINGATAN DINI BARA GAMBUT*`,
        `*PUSDALOPS BPBD & MANGGALA AGNI*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `⚠️ *STATUS: BARA AKTIF TERVERIFIKASI (SIAGA 1)*`,
        `🕒 *Waktu Deteksi:* ${timeStr} WIB`,
        `📍 *Lokasi:* ${targetArea.name}`,
        `📌 *Titik Sensor:* ${targetNode.id} (${targetNode.lat.toFixed(4)}, ${targetNode.lon.toFixed(4)})`,
        ``,
        `📊 *TELEMETRI BAWAH PERMUKAAN (FISIKA GAMBUT):*`,
        `• Kedalaman Bara: *${depthCm} cm*`,
        `• Suhu Inti: *${tempC}°C* (Laju: +${rateC}°C/jam)`,
        `• Gas CO Permukaan: *${coPpm} ppm* (Ambang Kritis >50 ppm)`,
        `• Validasi Fusi: *3/3 Sinyal Terpenuhi* (S1 Termal + S2 Tetangga + S3 Gas CO)`,
        ``,
        `🧭 *PREDIKSI ARAH & DINAMIKA RAMBATAN:*`,
        `• Vektor Arah: *${direction}* → PK-05`,
        `• Estimasi Muncul Permukaan: *±${etaHours} jam*`,
        ``,
        `🎯 *PANDUAN TAKTIS REGU DAMKAR (OPERASIONAL):*`,
        `• Tindakan: *Suntik nozzle gambut 850 Liter*`,
        `• Kedalaman Penetrasi: *z* = ${depthCm} cm* pada titik ${targetNode.id}`,
        `• Prioritas: Lokalisir perimeter sekat sebelum bara merayap ke blok tetangga`,
        ``,
        `📲 *AKSES TAMPILAN TAKTIS REGU (ZERO LOGIN):*`,
        `${alertLink}`,
        `_(Buka tautan di atas untuk navigasi GPS Google Maps 1-klik, konfirmasi menuju lokasi, dan pencatatan volume liter air)_`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `📡 *Transmisi:* LoRa SX1278 (433 MHz, RSSI -84 dBm) via Posko Gateway`,
      ].join("\n");

    const result = await sendWhatsAppMessage(target, message);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          target,
          error:
            (result.providerResponse as any)?.reason ||
            (result.providerResponse as any)?.error ||
            "Gagal mengirim pesan WhatsApp via Fonnte API",
          provider_response: result.providerResponse,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      target,
      alert_id: activeAlert.id,
      node_id: targetNode.id,
      token,
      alert_url: alertLink,
      message: result.messageText,
      provider_response: result.providerResponse,
    });
  } catch (error) {
    console.error("POST /api/alerts/test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "internal_error", message: "Gagal memproses pesan darurat WhatsApp", details: String(error) },
      },
      { status: 500 }
    );
  }
}
