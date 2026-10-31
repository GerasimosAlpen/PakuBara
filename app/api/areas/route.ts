import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStore, MockArea } from "@/lib/mock-store";
import { createAreaSchema } from "@/lib/validators/schemas";

export async function GET() {
  try {
    if (prisma) {
      try {
        const areas = await prisma.area.findMany({
          orderBy: { name: "asc" },
        });
        if (areas.length > 0) {
          return NextResponse.json({ success: true, data: areas });
        }
      } catch (dbErr) {
        console.warn("Prisma areas query failed, fallback to mock:", dbErr);
      }
    }

    return NextResponse.json({ success: true, data: mockStore.areas });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = createAreaSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Format payload tidak valid", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, boundary_geojson, phone_recipients } = parsed.data;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const mockArea: MockArea = {
      id: `a0000000-0000-0000-0000-${Date.now().toString(16).padStart(12, "0")}`,
      org_id: "d0000000-0000-0000-0000-000000000001",
      name,
      slug,
      boundary_geojson: boundary_geojson || {
        type: "Polygon",
        coordinates: [
          [
            [102.668, -1.229],
            [102.689, -1.229],
            [102.689, -1.242],
            [102.668, -1.242],
            [102.668, -1.229],
          ],
        ],
      },
      phone_recipients: phone_recipients ?? [],
      risk_level: "low",
      safe_days_streak: 0,
      is_active: true,
    };
    mockStore.areas.push(mockArea);

    return NextResponse.json({ success: true, data: mockArea }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
