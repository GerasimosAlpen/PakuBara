import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStore } from "@/lib/mock-store";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = [];

    // Evaluate in mockStore
    for (const area of mockStore.areas) {
      const activeAlerts = mockStore.alerts.filter(
        (a) => a.area_id === area.id && (a.status === "open" || a.status === "in_progress")
      );

      if (activeAlerts.length === 0) {
        area.safe_days_streak = (area.safe_days_streak || 0) + 1;
        if (area.safe_days_streak >= 3) {
          area.risk_level = "low";
        }
      } else {
        area.safe_days_streak = 0;
        area.risk_level = "high";
      }

      results.push({
        area_id: area.id,
        name: area.name,
        safe_days_streak: area.safe_days_streak,
        risk_level: area.risk_level,
      });
    }

    if (prisma) {
      try {
        for (const res of results) {
          await prisma.area.update({
            where: { id: res.area_id },
            data: {
              status: res.risk_level === "low" ? "safe" : "monitoring",
              safeSince: res.risk_level === "low" ? new Date() : null,
            },
          });
        }
      } catch (dbErr) {
        console.warn("Prisma area-safety update failed, using mock:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Evaluasi rantai hari aman wilayah (Permen LHK P.32/2016) berhasil diproses.",
      data: results,
      evaluated_at: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
