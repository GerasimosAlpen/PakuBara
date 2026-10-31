import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function POST() {
  try {
    mockStore.reset();
    return NextResponse.json({
      success: true,
      message: "State simulasi demo berhasil dikembalikan ke kondisi awal",
    });
  } catch (error) {
    console.error("Gagal mereset simulasi demo:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

