import { NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-store";

export async function GET() {
  try {
    const totalNodes = mockStore.nodes.length;
    const activeNodes = mockStore.nodes.filter((n) => n.status !== "offline").length;
    const emberActive = mockStore.nodes.filter((n) => n.status === "active").length;
    const openAlerts = mockStore.alerts.filter((a) =>
      ["open", "acknowledged", "in_progress"].includes(a.status)
    ).length;

    // Highest CO reading
    const gasNodes = mockStore.nodes.filter((n) => n.type === "gas");
    const maxCo = Math.max(0, ...gasNodes.map((g) => g.last_reading.co || 0));

    // Safe area percent (e.g. 75%)
    const normalNodes = mockStore.nodes.filter((n) => n.status === "normal").length;
    const safePercent = Math.round((normalNodes / Math.max(1, totalNodes)) * 100);

    // 24h sparkline samples
    const sparkline = [32, 33, 31, 30, 31, 34, 38, 42, 49, 58, 67, 78, 87, 85, 82, 75, 68, 59, 52, 45, 41, 38, 35, 34];

    return NextResponse.json({
      kpi: {
        total_nodes: totalNodes,
        active_nodes: activeNodes,
        ember_active: emberActive,
        open_alerts: openAlerts,
        safe_percent: safePercent,
        max_co_ppm: maxCo,
        water_recommendation_liters: emberActive > 0 ? 120 * emberActive : 0,
      },
      sparkline_24h: sparkline,
      last_updated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/stats/overview error:", error);
    return NextResponse.json(
      { error: { code: "internal_error", message: "Gagal mengambil statistik komando" } },
      { status: 500 }
    );
  }
}

