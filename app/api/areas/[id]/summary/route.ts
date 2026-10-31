import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStore, MockArea, MockNode } from "@/lib/mock-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let area = mockStore.areas.find((a) => a.id === id || a.slug === id);
    let nodes = mockStore.nodes.filter((n) => !area || n.area_id === area.id);
    let alerts = mockStore.alerts.filter(
      (a) => (!area || a.area_id === area.id) && (a.status === "open" || a.status === "in_progress")
    );

    if (prisma) {
      try {
        const dbArea = await prisma.area.findFirst({
          where: { OR: [{ id }, { slug: id }] },
          include: {
            nodes: true,
            alerts: { where: { status: { in: ["open", "in_progress", "acknowledged"] } } },
          },
        });
        if (dbArea) {
          area = {
            id: dbArea.id,
            org_id: dbArea.orgId,
            name: dbArea.name,
            slug: dbArea.slug || id,
            boundary_geojson: area?.boundary_geojson || { type: "Polygon", coordinates: [] },
            risk_level: (area?.risk_level || "low") as "low" | "medium" | "high" | "extreme",
            safe_days_streak: area?.safe_days_streak || 1,
            phone_recipients: area?.phone_recipients || [],
            is_active: true,
          };
          nodes = ((dbArea as any).nodes || []).map((n: any) => ({
            id: n.id,
            short_id: n.shortId,
            org_id: n.orgId,
            area_id: n.areaId || "",
            type: n.type as "probe" | "gas",
            lat: 0,
            lon: 0,
            status: n.status as "normal" | "watch" | "warning" | "active" | "offline",
            batt_mv: n.battMv ?? 3900,
            rssi: n.rssi ?? -80,
            last_seen: n.lastSeen ? new Date(n.lastSeen).toISOString() : new Date().toISOString(),
            last_reading: {},
          }));
        }
      } catch (dbErr) {
        console.warn("Prisma area summary query failed, fallback to mock:", dbErr);
      }
    }

    if (!area) {
      return NextResponse.json(
        { error: "Area tidak ditemukan", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Node status breakdown
    const statusCounts = {
      normal: 0,
      watch: 0,
      warning: 0,
      active: 0,
      offline: 0,
    };

    let totalT50 = 0;
    let countT50 = 0;
    let maxCO = 0;

    for (const node of nodes) {
      statusCounts[node.status] = (statusCounts[node.status] || 0) + 1;
      if (node.last_reading.t50 !== undefined) {
        totalT50 += node.last_reading.t50;
        countT50++;
      }
      if (node.last_reading.co !== undefined && node.last_reading.co > maxCO) {
        maxCO = node.last_reading.co;
      }
    }

    const avgT50 = countT50 > 0 ? parseFloat((totalT50 / countT50).toFixed(1)) : 30.5;
    const requiredDays = 3;
    const streak = area.safe_days_streak ?? 1;
    const isSafe = statusCounts.active === 0 && statusCounts.warning === 0;

    return NextResponse.json({
      success: true,
      data: {
        area,
        nodes_total: nodes.length,
        status_breakdown: statusCounts,
        open_alerts_count: alerts.length,
        avg_temp_50cm: avgT50,
        max_co_ppm: maxCO,
        is_safe: isSafe,
        safe_streak_progress: {
          current_days: streak,
          target_days: requiredDays,
          percentage: Math.min(100, Math.round((streak / requiredDays) * 100)),
          status_text: `${streak} dari ${requiredDays} hari stabil`,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
