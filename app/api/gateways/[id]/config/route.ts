import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json({
      success: true,
      data: {
        gateway_id: id,
        lora_frequency_mhz: 433.175,
        lora_bandwidth_khz: 125,
        lora_spreading_factor: 10,
        lora_coding_rate: "4/5",
        lora_sync_word: 0x34,
        heartbeat_interval_sec: 60,
        buffer_flush_batch_size: 20,
        command_poll_interval_sec: 30,
        firmware_latest: "v1.2.0-esp32",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

