// POST /api/cases/[id]/verify-k3 - K3 Zero-Energy Safety Verification
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
      verifierName,
      verifierRole,
      verifierNip,
      zeroEnergyConfirmed,
      padlockSecured,
      dangerTagAffixed,
      areaClear,
      checklistNotes,
    } = body;

    // RBAC check: Only Verifikator K3 is permitted to verify zero energy!
    if (!PERMISSIONS.canVerifyK3(verifierRole)) {
      return NextResponse.json(
        {
          error:
            "Akses Ditolak: Hanya personel dengan peran 'Verifikator K3' yang berwenang melakukan verifikasi keselamatan nol energi.",
        },
        { status: 403 }
      );
    }

    // Safety Golden Rule: Mandatory verification checkboxes
    if (!zeroEnergyConfirmed || !padlockSecured || !dangerTagAffixed) {
      return NextResponse.json(
        {
          error:
            "Aturan Keselamatan (Golden Rules): Seluruh poin checklist (Pemeriksaan Nol Energi, Pemasangan Padlock, dan Pemasangan Tag Bahaya) WAJIB diverifikasi secara fisik di lapangan sebelum persetujuan diberikan.",
        },
        { status: 400 }
      );
    }

    const existingCase = await prisma.lotoCase.findFirst({
      where: { OR: [{ id }, { caseNumber: id }] },
    });

    if (!existingCase) {
      return NextResponse.json(
        { error: "Data LOTO tidak ditemukan." },
        { status: 404 }
      );
    }

    // Save verification entry
    const verification = await prisma.k3Verification.create({
      data: {
        caseId: existingCase.id,
        verifierName: verifierName || "Dedi Kurniawan, S.K.M.",
        verifierRole: "Verifikator K3",
        verifierNip: verifierNip || "861234991K",
        zeroEnergyConfirmed: Boolean(zeroEnergyConfirmed),
        padlockSecured: Boolean(padlockSecured),
        dangerTagAffixed: Boolean(dangerTagAffixed),
        areaClear: Boolean(areaClear),
        checklistNotes: checklistNotes || "Pemeriksaan nol energi dan integritas gembok isolasi fisik telah diverifikasi di lapangan sesuai SOP CLG.05.01.31.",
        signatureEvidence: `VERIF-HASH-${Date.now()}-${existingCase.caseNumber}`,
        status: "Approved",
      },
    });

    // Update case status to Aktif (terisolasi penuh)
    const updatedCase = await prisma.lotoCase.update({
      where: { id: existingCase.id },
      data: {
        status: "Aktif",
        verifikasiK3: verifierName,
      },
    });

    // Log to immutable audit trail
    await logAuditEvent({
      caseId: existingCase.id,
      entityType: "VERIFICATION",
      entityId: verification.id,
      action: "VERIFY_K3",
      actorName: verifierName,
      actorRole: verifierRole,
      reason: `Verifikasi K3 Nol Energi berhasil disahkan untuk kasus ${existingCase.caseNumber}`,
      diffBefore: { status: existingCase.status },
      diffAfter: { status: "Aktif", verifierName },
    });

    return NextResponse.json({
      message: "Verifikasi K3 berhasil disahkan. Status LOTO kini AKTIF TERISOLASI.",
      verification,
      case: updatedCase,
    });
  } catch (error: any) {
    console.error("Error in verify-k3:", error);
    return NextResponse.json(
      { error: "Gagal memproses verifikasi K3", details: error.message },
      { status: 500 }
    );
  }
}
