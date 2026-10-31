import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { command_id, status, executed_at, result } = body;

    if (!command_id) {
      return NextResponse.json(
        { error: "command_id wajib diisi", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Perintah ${command_id} berhasil diakui dengan status ${status || "executed"}`,
      acknowledged_at: executed_at || new Date().toISOString(),
      result: result || {},
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

