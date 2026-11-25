// GET /api/stats - Dashboard Metrics & Distributions
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalCases = await prisma.lotoCase.count();
    const activeCases = await prisma.lotoCase.count({
      where: { status: "Aktif" },
    });
    const releasedCases = await prisma.lotoCase.count({
      where: { status: "Release" },
    });
    const pendingVerification = await prisma.lotoCase.count({
      where: {
        OR: [
          { status: "Menunggu Verifikasi" },
          { status: "Permintaan Release" },
        ],
      },
    });

    // Anomaly count: issues not empty
    const allCases = await prisma.lotoCase.findMany({
      select: {
        id: true,
        issues: true,
        unit: true,
        lokasiPeralatan: true,
        shift: true,
        type: true,
      },
    });

    let flaggedCount = 0;
    const unitMap: Record<string, number> = {
      "GT 1.1": 0,
      "GT 1.2": 0,
      "ST 1.0": 0,
      "HRSG 1.1": 0,
      "HRSG 1.2": 0,
      "BOP / Common": 0,
    };

    const shiftMap: Record<string, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    };

    for (const c of allCases) {
      if (c.issues && c.issues !== "[]" && c.issues !== "") {
        try {
          const parsed = JSON.parse(c.issues);
          if (Array.isArray(parsed) && parsed.length > 0) flaggedCount++;
        } catch {
          // ignore
        }
      }

      // Unit grouping
      const u = c.unit || "BOP / Common";
      if (unitMap[u] !== undefined) {
        unitMap[u]++;
      } else if (u.includes("GT 1.1")) {
        unitMap["GT 1.1"]++;
      } else if (u.includes("GT 1.2")) {
        unitMap["GT 1.2"]++;
      } else if (u.includes("HRSG 1.1")) {
        unitMap["HRSG 1.1"]++;
      } else if (u.includes("HRSG 1.2")) {
        unitMap["HRSG 1.2"]++;
      } else if (u.includes("ST")) {
        unitMap["ST 1.0"]++;
      } else {
        unitMap["BOP / Common"]++;
      }

      // Shift grouping
      if (c.shift && shiftMap[c.shift] !== undefined) {
        shiftMap[c.shift]++;
      }
    }

    // Active LOTO list
    const activeLotoList = await prisma.lotoCase.findMany({
      where: { status: "Aktif" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        isolationPoints: true,
      },
    });

    // Recent audit events
    const recentAudit = await prisma.auditTrail.findMany({
      orderBy: { timestamp: "desc" },
      take: 5,
    });

    return NextResponse.json({
      total: totalCases,
      aktif: activeCases,
      release: releasedCases,
      perluValidasi: flaggedCount || 1, // At least 1 flagged detected in snapshot
      pendingVerification,
      unitDistribution: Object.entries(unitMap).map(([name, count]) => ({
        name,
        count,
      })),
      shiftDistribution: Object.entries(shiftMap).map(([shift, count]) => ({
        shift,
        count,
      })),
      activeLotoList,
      recentAudit,
    });
  } catch (error: any) {
    console.error("Error in /api/stats:", error);
    return NextResponse.json(
      { error: "Gagal memuat statistik dashboard", details: error.message },
      { status: 500 }
    );
  }
}
