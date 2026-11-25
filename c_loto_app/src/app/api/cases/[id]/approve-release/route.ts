// POST /api/cases/[id]/approve-release - Multi-Otorisasi & Eksekusi Penormalan Fisik Release LOTO
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
      actionType, // "SUPERVISOR_APPROVAL" | "K3_APPROVAL" | "EXECUTE_NORMALIZATION"
      actorName,
      actorRole,
      notes,
      normalizationAction,
    } = body;

    const existingCase = await prisma.lotoCase.findFirst({
      where: { OR: [{ id }, { caseNumber: id }] },
      include: {
        releaseRequests: { orderBy: { requestedAt: "desc" }, take: 1 },
        isolationPoints: true,
      },
    });

    if (!existingCase) {
      return NextResponse.json({ error: "Data LOTO tidak ditemukan." }, { status: 404 });
    }

    let releaseReq = existingCase.releaseRequests[0];
    if (!releaseReq) {
      // Create empty release request if not created earlier
      releaseReq = await prisma.releaseRequest.create({
        data: {
          caseId: existingCase.id,
          requestedBy: actorName || "Petugas Lapangan",
          requestedRole: actorRole || "Operator Shift",
          status: "Pending_Supervisor",
        },
      });
    }

    // 1. Supervisor Approval Step
    if (actionType === "SUPERVISOR_APPROVAL") {
      if (!PERMISSIONS.canApproveReleaseSupervisor(actorRole)) {
        return NextResponse.json(
          { error: "Akses Ditolak: Hanya Supervisor Shift yang berwenang memberikan otorisasi operasi release." },
          { status: 403 }
        );
      }

      const updatedReq = await prisma.releaseRequest.update({
        where: { id: releaseReq.id },
        data: {
          authorizedSupervisorApproval: true,
          supervisorName: actorName,
          supervisorApprovalAt: new Date(),
          status: releaseReq.k3ReleaseApproval ? "Ready_For_Physical_Normalization" : "Pending_K3",
        },
      });

      await logAuditEvent({
        caseId: existingCase.id,
        entityType: "RELEASE_REQUEST",
        entityId: updatedReq.id,
        action: "APPROVE_RELEASE_SUPERVISOR",
        actorName,
        actorRole,
        reason: `Persetujuan operasional release diberikan oleh Supervisor Operasi: ${notes || "SOP dipenuhi"}`,
      });

      return NextResponse.json({
        message: "Otorisasi Supervisor Shift berhasil dicatat.",
        releaseRequest: updatedReq,
      });
    }

    // 2. K3 Approval Step (CRITICAL: Only Verifikator K3, Admin cannot bypass!)
    if (actionType === "K3_APPROVAL") {
      if (!PERMISSIONS.canApproveReleaseK3(actorRole)) {
        return NextResponse.json(
          { error: "Akses Ditolak: Hanya Verifikator K3 yang berwenang mengesahkan pemeriksaan keselamatan pelepasan." },
          { status: 403 }
        );
      }

      const updatedReq = await prisma.releaseRequest.update({
        where: { id: releaseReq.id },
        data: {
          k3ReleaseApproval: true,
          k3VerifierName: actorName,
          k3ApprovalAt: new Date(),
          status: releaseReq.authorizedSupervisorApproval ? "Ready_For_Physical_Normalization" : "Pending_Supervisor",
        },
      });

      await logAuditEvent({
        caseId: existingCase.id,
        entityType: "RELEASE_REQUEST",
        entityId: updatedReq.id,
        action: "APPROVE_RELEASE_K3",
        actorName,
        actorRole,
        reason: `Verifikasi K3 untuk pelepasan isolasi disahkan: ${notes || "Zero energy and permit verified"}`,
      });

      return NextResponse.json({
        message: "Otorisasi Verifikator K3 berhasil dicatat.",
        releaseRequest: updatedReq,
      });
    }

    // 3. Physical Normalization Step (Pelepasan gembok & penormalan fisik aktual di lapangan)
    if (actionType === "EXECUTE_NORMALIZATION") {
      // Must have both approvals
      if (!releaseReq.authorizedSupervisorApproval || !releaseReq.k3ReleaseApproval) {
        return NextResponse.json(
          {
            error:
              "Blokir Keselamatan: Penormalan fisik TIDAK DAPAT dilakukan sebelum otorisasi Supervisor Shift DAN Verifikator K3 lengkap disahkan.",
          },
          { status: 400 }
        );
      }

      if (!PERMISSIONS.canRecordPhysicalNormalization(actorRole)) {
        return NextResponse.json(
          { error: "Akses Ditolak: Hanya Operator Shift atau Maintenance Authorized yang berwenang mengeksekusi penormalan fisik." },
          { status: 403 }
        );
      }

      const todayIso = new Date().toISOString().slice(0, 10);

      // Update release request
      const updatedReq = await prisma.releaseRequest.update({
        where: { id: releaseReq.id },
        data: {
          physicalNormalizationConfirmed: true,
          normalizationExecutor: actorName,
          normalizationExecutedAt: new Date(),
          normalizationNotes: notes || normalizationAction || "Penormalan fisik peralatan telah dieksekusi di lapangan.",
          status: "Completed",
        },
      });

      // Update all isolation points to normalized
      await prisma.isolationPoint.updateMany({
        where: { caseId: existingCase.id },
        data: {
          normalized: true,
          normalizedAt: new Date(),
          normalizedBy: actorName,
        },
      });

      // Update case to Release
      const updatedCase = await prisma.lotoCase.update({
        where: { id: existingCase.id },
        data: {
          status: "Release",
          tanggalRelease: todayIso,
          penormalan: normalizationAction || "Penormalan posisi katup/breaker selesai",
          executorRelease: actorName,
          verifikasiK3Release: releaseReq.k3VerifierName || "Tim K3",
        },
      });

      await logAuditEvent({
        caseId: existingCase.id,
        entityType: "RELEASE_REQUEST",
        entityId: updatedReq.id,
        action: "EXECUTE_NORMALIZATION",
        actorName,
        actorRole,
        reason: `Penormalan fisik peralatan berhasil dieksekusi di lapangan oleh ${actorName}. Kasus resmi RELEASE.`,
        diffBefore: { status: existingCase.status },
        diffAfter: { status: "Release", tanggalRelease: todayIso },
      });

      return NextResponse.json({
        message: "Penormalan fisik berhasil dicatat. Status LOTO resmi RELEASE.",
        releaseRequest: updatedReq,
        case: updatedCase,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (error: any) {
    console.error("Error in approve-release:", error);
    return NextResponse.json(
      { error: "Gagal memproses otorisasi release", details: error.message },
      { status: 500 }
    );
  }
}
