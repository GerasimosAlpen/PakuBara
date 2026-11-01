export interface WhatsAppAlertPayload {
  areaName: string;
  nodeId: string;
  lat: number;
  lon: number;
  depthCm: number;
  tempC: number;
  rateCPerHour: number;
  directionText: string;
  targetNeighborId?: string;
  etaSurfaceHours: number;
  waterRecommendationLiters: number;
  alertToken: string;
  targetPhone?: string;
}

export interface FonnteSendResult {
  success: boolean;
  status: "sent" | "queued" | "failed";
  messageText: string;
  providerResponse?: unknown;
}

/**
 * Formats the operational emergency alert message for field responders with full physics telemetry.
 */
export function formatEmergencyAlertMessage(
  payload: WhatsAppAlertPayload,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || "https://pakubara.vercel.app"
): string {
  const nextTarget = payload.targetNeighborId ? ` → ${payload.targetNeighborId}` : "";
  const alertLink = `${appUrl}/a/${payload.alertToken}`;

  return [
    `🚨 *PAKUBARA | SISTEM PERINGATAN DINI BARA GAMBUT*`,
    `*PUSDALOPS BPBD & MANGGALA AGNI*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ *STATUS: BARA AKTIF TERVERIFIKASI (SIAGA 1)*`,
    `📍 *Area:* ${payload.areaName}`,
    `📌 *Titik Sensor:* ${payload.nodeId} (${payload.lat.toFixed(4)}, ${payload.lon.toFixed(4)})`,
    ``,
    `📊 *TELEMETRI BAWAH PERMUKAAN:*`,
    `• Kedalaman Bara: *${payload.depthCm} cm*`,
    `• Suhu Inti: *${payload.tempC.toFixed(1)}°C* (Laju: +${payload.rateCPerHour.toFixed(1)}°C/jam)`,
    `• Validasi: *Fusi Sinyal Aktif (Suhu + Tetangga Spasial + Gas CO)*`,
    ``,
    `🧭 *PREDIKSI ARAH & DINAMIKA RAMBATAN:*`,
    `• Vektor Arah: *${payload.directionText}${nextTarget}*`,
    `• Perkiraan Muncul Permukaan: *±${payload.etaSurfaceHours.toFixed(1)} jam*`,
    ``,
    `🎯 *PANDUAN OPERASIONAL REGU:*`,
    `• Tindakan: *Suntik air ${payload.waterRecommendationLiters} Liter*`,
    `• Kedalaman Penetrasi: *z* = ${payload.depthCm} cm* pada titik ${payload.nodeId}`,
    ``,
    `📲 *BUKA PETA & TINDAKAN LAPANGAN:*`,
    `${alertLink}`,
    `_(Navigasi GPS Google Maps 1-klik, konfirmasi menuju lokasi, & catat liter air)_`,
  ].join("\n");
}

/**
 * Formats notification when a peat fire alert has been resolved.
 */
export function formatResolvedMessage(nodeId: string, areaName: string): string {
  return [
    `✅ *PAKUBARA | PENANGANAN SELESAI & TITIK STABIL*`,
    `*PUSDALOPS BPBD & MANGGALA AGNI*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📍 *Area:* ${areaName}`,
    `📌 *Titik Sensor:* ${nodeId}`,
    `🌡️ *Status:* Suhu tanah telah turun di bawah ambang batas bahaya (<35°C).`,
    `🛡️ *Lahan Memasuki Fase:* Stabilisasi & pemantauan intensif 72 jam bebas bara.`,
  ].join("\n");
}

/**
 * Sends a WhatsApp message via Fonnte API.
 */
export async function sendWhatsAppMessage(
  target: string,
  message: string
): Promise<FonnteSendResult> {
  const token = (process.env.FONNTE_TOKEN || "").trim().replace(/^["']|["']$/g, "");
  const rawTarget = target || process.env.FONNTE_DEFAULT_TARGET || "";
  const targetNumber = rawTarget.trim().replace(/^["']|["']$/g, "").replace(/[^\d]/g, "");

  if (!token || !targetNumber) {
    const errorMsg = `FONNTE_TOKEN atau nomor target tidak valid (token: ${token ? "ADA" : "KOSONG"}, target: ${targetNumber || "KOSONG"})`;
    console.error(errorMsg);
    return {
      success: false,
      status: "failed",
      messageText: message,
      providerResponse: { error: errorMsg },
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("target", targetNumber);
    formData.append("message", message);
    formData.append("countryCode", "62");

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && (data.status === true || data.status === "true")) {
      return {
        success: true,
        status: "sent",
        messageText: message,
        providerResponse: data,
      };
    } else {
      console.error("Fonnte API response error:", data);
      return {
        success: false,
        status: "failed",
        messageText: message,
        providerResponse: data,
      };
    }
  } catch (error) {
    console.error("Fonnte network error:", error);
    return {
      success: false,
      status: "failed",
      messageText: message,
      providerResponse: { error: String(error) },
    };
  }
}
