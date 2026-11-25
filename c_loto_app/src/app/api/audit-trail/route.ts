// GET /api/audit-trail - Immutable Append-Only Audit Trail
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const action = searchParams.get("action") || "Semua";
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const where: any = {};
    if (action !== "Semua") {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { actorName: { contains: search } },
        { entityId: { contains: search } },
        { reason: { contains: search } },
        { action: { contains: search } },
      ];
    }

    const auditLogs = await prisma.auditTrail.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      include: {
        case: {
          select: {
            caseNumber: true,
            kks: true,
            namaPeralatan: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(auditLogs);
  } catch (error: any) {
    console.error("Error fetching audit trail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil audit trail", details: error.message },
      { status: 500 }
    );
  }
}
