// GET /api/shift-handover & POST /api/shift-handover
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const handovers = await prisma.shiftHandover.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json(handovers);
  } catch (error: any) {
    console.error("Error fetching shift handovers:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar serah terima shift", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      outgoingShift,
      incomingShift,
      outgoingSupervisor,
      specialNotes,
      safetyIncidents,
      actorRole,
    } = body;

    if (!PERMISSIONS.canCreateShiftHandover(actorRole)) {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Operator atau Supervisor yang dapat membuat serah terima shift." },
        { status: 403 }
      );
    }

    // Get current active cases snapshot
    const activeCases = await prisma.lotoCase.findMany({
      where: { status: "Aktif" },
      select: { caseNumber: true, kks: true, namaPeralatan: true, lokasiPeralatan: true, shift: true },
    });

    const handover = await prisma.shiftHandover.create({
      data: {
        handoverDate: new Date().toISOString().slice(0, 10),
        outgoingShift: outgoingShift || "Shift B",
        incomingShift: incomingShift || "Shift C",
        outgoingSupervisor: outgoingSupervisor || "Supervisor Shift",
        activeCasesCount: activeCases.length,
        activeCasesSnapshot: JSON.stringify({
          count: activeCases.length,
          sample: activeCases.slice(0, 15),
        }),
        specialNotes: specialNotes || "Seluruh titik isolasi LOTO aktif terpasang gembok fisik dan aman.",
        safetyIncidents: safetyIncidents || "Nihil - Zero Accident",
        status: "Submitted",
      },
    });

    await logAuditEvent({
      entityType: "SHIFT_HANDOVER",
      entityId: handover.id,
      action: "SHIFT_HANDOVER_SUBMIT",
      actorName: outgoingSupervisor,
      actorRole,
      reason: `Serah terima shift dari ${outgoingShift} ke ${incomingShift} diserahkan dengan ${activeCases.length} LOTO Aktif.`,
    });

    return NextResponse.json(handover, { status: 201 });
  } catch (error: any) {
    console.error("Error creating shift handover:", error);
    return NextResponse.json(
      { error: "Gagal mencatat serah terima shift", details: error.message },
      { status: 500 }
    );
  }
}
