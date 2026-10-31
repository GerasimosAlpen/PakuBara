import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET() {
  try {
    const headers = [
      "ID",
      "Waktu (WIB)",
      "ID Titik",
      "Jenis Tindakan",
      "Liter Air",
      "Kedalaman (cm)",
      "Catatan",
    ];

    const rows = mockStore.actions.map((a) => [
      a.id,
      new Date(a.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      a.node_id || "-",
      a.kind,
      a.water_liters ?? 0,
      a.depth_cm ?? "-",
      `"${(a.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pakubara-actions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/reports/actions.csv error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengekspor log CSV" } },
      { status: 500 }
    );
  }
}

