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
 * Formats the standard 8-line emergency alert message for field responders.
 */
export function formatEmergencyAlertMessage(
  payload: WhatsAppAlertPayload,
  appUrl: string = process.env.NEXT_PUBLIC_APP_URL || "https://pakubara.vercel.app"
): string {
  const nextTarget = payload.targetNeighborId ? ` -> ${payload.targetNeighborId}` : "";
  const alertLink = `${appUrl}/a/${payload.alertToken}`;

  return [
    `🔥 PAKUBARA | BARA AKTIF`,
    `Area: ${payload.areaName}`,
    `Titik: ${payload.nodeId} (${payload.lat.toFixed(4)}, ${payload.lon.toFixed(4)})`,
    `Kedalaman: ${payload.depthCm} cm | ${payload.tempC.toFixed(1)}°C, naik ${payload.rateCPerHour.toFixed(1)}°C/jam`,
    `Arah: ${payload.directionText}${nextTarget}`,
    `Perkiraan muncul: ±${payload.etaSurfaceHours} jam`,
    `Saran: suntik air ${payload.waterRecommendationLiters}L di kedalaman ${payload.depthCm} cm pada ${payload.nodeId}`,
    `Buka: ${alertLink}`,
  ].join("\n");
}

/**
 * Formats notification when a peat fire alert has been resolved.
 */
export function formatResolvedMessage(nodeId: string, areaName: string): string {
  return [
    `✅ PAKUBARA | TITIK KEMBALI NORMAL`,
    `Area: ${areaName}`,
    `Titik: ${nodeId}`,
    `Status: Penanganan selesai, suhu tanah di bawah ambang waspada.`,
    `Lahan memasuki fase stabilisasi pemantauan 72 jam.`,
  ].join("\n");
}

/**
 * Sends a WhatsApp message via Fonnte API with graceful fallback.
 */
export async function sendWhatsAppMessage(
  target: string,
  message: string
): Promise<FonnteSendResult> {
  const token = process.env.FONNTE_TOKEN;
  const targetNumber = target || process.env.FONNTE_DEFAULT_TARGET;

  if (!token || !targetNumber) {
    console.warn("Fonnte token or target number missing. Simulating WhatsApp send.");
    return {
      success: true,
      status: "queued",
      messageText: message,
      providerResponse: { simulated: true, reason: "FONNTE_TOKEN or target not set" },
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

