// POST /api/cases/[id]/request-release - Permintaan Release LOTO oleh Personel Terkait
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
    const {
      requestedBy,
      requestedRole,
      maintenanceDoneConfirmed,
      toolsPersonnelClearConfirmed,
      lockOwnerVerified,
      notes,
    } = body;

    // RBAC: Only authorized roles can initiate release
    if (!PERMISSIONS.canRequestRelease(requestedRole)) {
      return NextResponse.json(
        {
          error:
            "Akses Ditolak: Hanya Maintenance Authorized Person atau Operator Shift yang dapat mengajukan release.",
        },
        { status: 403 }
      );
    }

    // Safety checks
    if (!maintenanceDoneConfirmed || !toolsPersonnelClearConfirmed || !lockOwnerVerified) {
      return NextResponse.json(
        {
          error:
            "Persyaratan Keselamatan: Pekerjaan fisik harus selesai, seluruh personel dan perkakas harus bersih dari area, dan kepemilikan kunci harus diverifikasi sebelum pengajuan rilis.",
        },
        { status: 400 }
      );
    }

    const existingCase = await prisma.lotoCase.findFirst({
      where: { OR: [{ id }, { caseNumber: id }] },
      include: { releaseRequests: true },
    });

    if (!existingCase) {
      return NextResponse.json({ error: "Data LOTO tidak ditemukan." }, { status: 404 });
    }

    if (existingCase.status !== "Aktif" && existingCase.status !== "Permintaan Release") {
      return NextResponse.json(
        { error: `Kasus berstatus '${existingCase.status}'. Hanya status Aktif yang dapat diajukan release.` },
        { status: 400 }
      );
    }

    // Create or update ReleaseRequest
    const releaseReq = await prisma.releaseRequest.create({
      data: {
        caseId: existingCase.id,
        requestedBy: requestedBy || "Petugas Maintenance",
        requestedRole: requestedRole || "Maintenance Authorized Person",
        maintenanceDoneConfirmed: true,
        toolsPersonnelClearConfirmed: true,
        lockOwnerVerified: true,
        status: "Pending_Supervisor",
        normalizationNotes: notes || null,
      },
    });

    // Update case status
    const updatedCase = await prisma.lotoCase.update({
      where: { id: existingCase.id },
      data: { status: "Permintaan Release" },
    });

    await logAuditEvent({
      caseId: existingCase.id,
      entityType: "RELEASE_REQUEST",
      entityId: releaseReq.id,
      action: "REQUEST_RELEASE",
      actorName: requestedBy,
      actorRole: requestedRole,
      reason: "Pengajuan rilis LOTO setelah seluruh pekerjaan mekanikal/elektrikal selesai di lapangan.",
      diffBefore: { status: existingCase.status },
      diffAfter: { status: "Permintaan Release" },
    });

    return NextResponse.json({
      message: "Permohonan release berhasil didaftarkan. Menunggu otorisasi Supervisor Shift dan Verifikator K3.",
      releaseRequest: releaseReq,
      case: updatedCase,
    });
  } catch (error: any) {
    console.error("Error in request-release:", error);
    return NextResponse.json(
      { error: "Gagal memproses permohonan release", details: error.message },
      { status: 500 }
    );
  }
}
