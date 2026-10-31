import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStore } from "@/lib/mock-store";

// Offline Check Worker: dijalankan tiap 5 menit untuk menandai node yang tidak mengirim data > 30 menit
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let updatedCount = 0;

    if (prisma) {
      try {
        const result = await prisma.node.updateMany({
          where: {
            status: { not: "offline" },
            lastSeen: { lt: thirtyMinutesAgo },
          },
          data: { status: "offline" },
        });
        updatedCount = result.count;
      } catch (dbErr) {
        console.warn("Prisma offline check failed, updating mock store:", dbErr);
      }
    }

    // Mock store update
    for (const node of mockStore.nodes) {
      if (new Date(node.last_seen) < thirtyMinutesAgo && node.status !== "offline") {
        node.status = "offline";
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Offline check selesai. ${updatedCount} node ditandai offline.`,
      threshold: thirtyMinutesAgo.toISOString(),
      nodes_marked_offline: updatedCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

