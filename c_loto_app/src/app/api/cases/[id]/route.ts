// GET /api/cases/[id], PUT /api/cases/[id], DELETE /api/cases/[id]
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Search by database ID or caseNumber or KKS
    const lotoCase = await prisma.lotoCase.findFirst({
      where: {
        OR: [{ id }, { caseNumber: id }, { kks: id }],
      },
      include: {
        isolationPoints: {
          orderBy: { pointNumber: "asc" },
        },
        verifications: {
          orderBy: { verificationTime: "desc" },
        },
        releaseRequests: {
          orderBy: { requestedAt: "desc" },
        },
        auditEvents: {
          orderBy: { timestamp: "desc" },
          take: 20,
        },
      },
    });

    if (!lotoCase) {
      return NextResponse.json(
        { error: `Data LOTO dengan identitas '${id}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    return NextResponse.json(lotoCase);
  } catch (error: any) {
    console.error("Error fetching case details:", error);
    return NextResponse.json(
      { error: "Gagal mengambil rincian data LOTO", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      namaPeralatan,
      lokasiPeralatan,
      unit,
      peralatan,
      bagian,
      shift,
      type,
      workOrderNumber,
      keterangan,
      eksekusi,
      executor,
      status,
      actorName = "Petugas",
      actorRole = "Operator Shift",
      reason = "Pembaruan informasi data LOTO",
    } = body;

    const existing = await prisma.lotoCase.findFirst({
      where: { OR: [{ id }, { caseNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data LOTO tidak ditemukan." },
        { status: 404 }
      );
    }

    const updated = await prisma.lotoCase.update({
      where: { id: existing.id },
      data: {
        namaPeralatan: namaPeralatan !== undefined ? namaPeralatan : existing.namaPeralatan,
        lokasiPeralatan: lokasiPeralatan !== undefined ? lokasiPeralatan : existing.lokasiPeralatan,
        unit: unit !== undefined ? unit : existing.unit,
        peralatan: peralatan !== undefined ? peralatan : existing.peralatan,
        bagian: bagian !== undefined ? bagian : existing.bagian,
        shift: shift !== undefined ? shift : existing.shift,
        type: type !== undefined ? type : existing.type,
        workOrderNumber: workOrderNumber !== undefined ? workOrderNumber : existing.workOrderNumber,
        keterangan: keterangan !== undefined ? keterangan : existing.keterangan,
        eksekusi: eksekusi !== undefined ? eksekusi : existing.eksekusi,
        executor: executor !== undefined ? executor : existing.executor,
        status: status !== undefined ? status : existing.status,
      },
    });

    await logAuditEvent({
      caseId: existing.id,
      entityType: "LOTO_CASE",
      entityId: existing.caseNumber,
      action: "UPDATE",
      actorName,
      actorRole,
      reason,
      diffBefore: {
        namaPeralatan: existing.namaPeralatan,
        status: existing.status,
      },
      diffAfter: {
        namaPeralatan: updated.namaPeralatan,
        status: updated.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data LOTO", details: error.message },
      { status: 500 }
    );
  }
}
