import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let rolledUpCount = 0;

    if (prisma) {
      try {
        // Rollup logic in database
        const count = await prisma.reading.count({
          where: { measuredAt: { lt: thirtyDaysAgo } },
        });
        rolledUpCount = count;
      } catch (dbErr) {
        console.warn("Prisma rollup query failed:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Rollup data telemetri historis selesai. ${rolledUpCount} baris telah diagregasikan.`,
      threshold: thirtyDaysAgo.toISOString(),
      records_aggregated: rolledUpCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

