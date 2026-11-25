// POST /api/shift-handover/[id]/acknowledge - Konfirmasi Penerimaan Shift oleh Supervisor Masuk
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { incomingSupervisor, actorRole, notes } = body;

    if (!PERMISSIONS.canAcknowledgeShiftHandover(actorRole)) {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Supervisor Shift yang berwenang menandatangani penerimaan shift." },
        { status: 403 }
      );
    }

    const handover = await prisma.shiftHandover.findUnique({
      where: { id },
    });

    if (!handover) {
      return NextResponse.json({ error: "Data serah terima tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.shiftHandover.update({
      where: { id },
      data: {
        incomingSupervisor: incomingSupervisor || "Supervisor Masuk",
        acknowledgedAt: new Date(),
        status: "Acknowledged",
        specialNotes: notes ? `${handover.specialNotes}\n[Catatan Regu Masuk]: ${notes}` : handover.specialNotes,
      },
    });

    await logAuditEvent({
      entityType: "SHIFT_HANDOVER",
      entityId: updated.id,
      action: "SHIFT_HANDOVER_ACKNOWLEDGE",
      actorName: incomingSupervisor,
      actorRole,
      reason: `Serah terima shift diterima dan disahkan oleh ${incomingSupervisor} (${handover.incomingShift})`,
    });

    return NextResponse.json({
      message: "Serah terima shift berhasil dikonfirmasi dan disahkan.",
      handover: updated,
    });
  } catch (error: any) {
    console.error("Error acknowledging shift handover:", error);
    return NextResponse.json(
      { error: "Gagal mengonfirmasi serah terima shift", details: error.message },
      { status: 500 }
    );
  }
}
