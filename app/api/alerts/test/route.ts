import { NextRequest, NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/lib/integrations/fonnte";

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

    const message =
      body.message ||
      [
        `🔥 PAKUBARA | UJI COBA NOTIFIKASI POSKO`,
        `Waktu: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`,
        `Sistem: Gateway LoRa dan Mesin Peringatan PakuBara terhubung dengan baik.`,
        `Tujuan: Pengujian jalur komunikasi darurat regu lapangan.`,
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
      message: result.messageText,
      provider_response: result.providerResponse,
    });
  } catch (error) {
    console.error("POST /api/alerts/test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "internal_error", message: "Gagal mengirim pesan uji WhatsApp", details: String(error) },
      },
      { status: 500 }
    );
  }
}
