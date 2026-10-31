import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockStore, MockGateway } from "@/lib/mock-store";
import { registerGatewaySchema } from "@/lib/validators/schemas";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const areaId = req.nextUrl.searchParams.get("area_id");

  try {
    if (prisma) {
      try {
        const gateways = await prisma.gateway.findMany({
          where: areaId ? { areaId } : undefined,
          orderBy: { lastSeen: "desc" },
        });
        if (gateways.length > 0) {
          return NextResponse.json({ success: true, data: gateways });
        }
      } catch (dbErr) {
        console.warn("Prisma gateways query failed, falling back to mock:", dbErr);
      }
    }

    let list = mockStore.gateways;
    if (areaId) {
      list = list.filter((g) => g.area_id === areaId);
    }
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    if ((error as any)?.digest?.startsWith("NEXT_")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = registerGatewaySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Format payload tidak valid", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { area_id, name, mac_address, firmware_version } = parsed.data;
    const generatedApiKey = `pkb_gw_${crypto.randomBytes(16).toString("hex")}`;
    const apiKeyHash = crypto.createHash("sha256").update(generatedApiKey).digest("hex");
    const gwId = `gw-${Date.now().toString(16)}`;

    if (prisma) {
      try {
        const created = await prisma.gateway.create({
          data: {
            id: gwId,
            orgId: "d0000000-0000-0000-0000-000000000001",
            areaId: area_id,
            apiKeyHash,
            lastSeen: new Date(),
          },
        });
        return NextResponse.json(
          {
            success: true,
            data: { ...created, api_key: generatedApiKey, name, mac_address },
            note: "Simpan api_key ini, tidak akan ditampilkan ulang.",
          },
          { status: 201 }
        );
      } catch (dbErr) {
        console.warn("Prisma gateway create failed, fallback to mock:", dbErr);
      }
    }

    const mockGw: MockGateway = {
      id: gwId,
      org_id: "d0000000-0000-0000-0000-000000000001",
      area_id,
      name,
      mac_address,
      status: "online",
      firmware_version: firmware_version ?? "v1.2.0-esp32",
      last_ping: new Date().toISOString(),
      api_key_hash: apiKeyHash,
    };
    mockStore.gateways.push(mockGw);

    return NextResponse.json(
      {
        success: true,
        data: { ...mockGw, api_key: generatedApiKey },
        note: "Simpan api_key ini, tidak akan ditampilkan ulang.",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: String(error) },
      { status: 500 }
    );
  }
}
