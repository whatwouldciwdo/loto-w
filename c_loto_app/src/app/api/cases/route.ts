// GET /api/cases - List, Search, Filter & POST - Create LOTO Case
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { validateLotoEntry } from "@/lib/loto-validator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "Semua";
    const area = searchParams.get("area") || "Semua";
    const shift = searchParams.get("shift") || "Semua";
    const type = searchParams.get("type") || "Semua";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const onlyActive = searchParams.get("onlyActive") === "true";

    const where: any = {};

    if (onlyActive) {
      where.status = "Aktif";
    } else if (status !== "Semua") {
      where.status = status;
    }

    if (shift !== "Semua") {
      where.shift = shift;
    }

    if (type !== "Semua") {
      where.type = type;
    }

    if (area !== "Semua") {
      where.OR = [
        { lokasiPeralatan: { contains: area } },
        { unit: { contains: area } },
      ];
    }

    if (search) {
      where.OR = [
        { kks: { contains: search } },
        { nomorLockTag: { contains: search } },
        { namaPeralatan: { contains: search } },
        { lokasiPeralatan: { contains: search } },
        { bagian: { contains: search } },
        { workOrderNumber: { contains: search } },
        { caseNumber: { contains: search } },
      ];
    }

    const total = await prisma.lotoCase.count({ where });
    const cases = await prisma.lotoCase.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        isolationPoints: true,
        verifications: {
          take: 1,
          orderBy: { verificationTime: "desc" },
        },
        releaseRequests: {
          take: 1,
          orderBy: { requestedAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      data: cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data LOTO", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      kks,
      nomorLockTag,
      namaPeralatan,
      lokasiPeralatan,
      unit,
      peralatan,
      bagian,
      shift,
      type,
      workOrderNumber,
      energyTypes,
      keterangan,
      eksekusi,
      executor,
      isolationPoints = [],
      actorName = "Petugas Shift",
      actorRole = "Operator Shift",
    } = body;

    if (!kks || !namaPeralatan) {
      return NextResponse.json(
        { error: "KKS dan Nama Peralatan wajib diisi!" },
        { status: 400 }
      );
    }

    // Generate unique caseNumber: LOTO-2026-XXXX
    const count = await prisma.lotoCase.count();
    const caseNumber = `LOTO-2026-${String(count + 1).padStart(4, "0")}`;

    // Validate anomaly detection
    const issues = validateLotoEntry({
      kks,
      nomor_lock_tag: nomorLockTag,
      nama_peralatan: namaPeralatan,
      status: "Draft",
      tanggal: new Date().toISOString().slice(0, 10),
    });

    const newCase = await prisma.lotoCase.create({
      data: {
        caseNumber,
        sourceSheet: "SISTEM_WEB",
        no: String(count + 1),
        shift: shift || "B",
        tanggal: new Date().toISOString().slice(0, 10),
        kks: String(kks).trim(),
        nomorLockTag: String(nomorLockTag || "").trim(),
        type: type || "WO CM",
        status: "Draft",
        namaPeralatan: String(namaPeralatan).trim(),
        lokasiPeralatan: String(lokasiPeralatan || unit || "Area Pembangkit").trim(),
        unit: unit || "BOP / Common",
        peralatan: peralatan || "Valve",
        bagian: bagian || "Operasi",
        energyTypes: JSON.stringify(energyTypes || ["Mekanik"]),
        workOrderNumber: workOrderNumber || null,
        eksekusi: eksekusi || "Isolasi Fisik",
        executor: executor || actorName,
        keterangan: keterangan || "",
        issues: JSON.stringify(issues.map((i) => i.code)),
        detailTambahan: JSON.stringify([]),
        sopValidationPending: false,
      },
    });

    // Create isolation points if provided
    if (Array.isArray(isolationPoints) && isolationPoints.length > 0) {
      for (let i = 0; i < isolationPoints.length; i++) {
        const pt = isolationPoints[i];
        await prisma.isolationPoint.create({
          data: {
            caseId: newCase.id,
            pointNumber: i + 1,
            pointName: pt.pointName || `${namaPeralatan} - Titik ${i + 1}`,
            kksCode: pt.kksCode || kks,
            energyType: pt.energyType || "Mekanik",
            isolationMethod: pt.isolationMethod || "Locked",
            padlockNumber: String(pt.padlockNumber || nomorLockTag || `LB-${i + 1}`).trim(),
            tagNumber: String(pt.tagNumber || `TAG-${i + 1}`).trim(),
            isZeroEnergyVerified: Boolean(pt.isZeroEnergyVerified),
            verificationMethod: pt.verificationMethod || "Visual / Test",
          },
        });
      }
    } else {
      // Create single default point
      await prisma.isolationPoint.create({
        data: {
          caseId: newCase.id,
          pointNumber: 1,
          pointName: `${namaPeralatan} - Isolator Utama`,
          kksCode: String(kks).trim(),
          energyType: peralatan?.toLowerCase().includes("breaker") ? "Listrik" : "Mekanik",
          isolationMethod: eksekusi || "OFF / Padlocked",
          padlockNumber: String(nomorLockTag || "LB-001").trim(),
          tagNumber: String(nomorLockTag ? `TAG-${nomorLockTag}` : "TAG-001").trim(),
          isZeroEnergyVerified: false,
        },
      });
    }

    // Log to audit trail
    await logAuditEvent({
      caseId: newCase.id,
      entityType: "LOTO_CASE",
      entityId: newCase.caseNumber,
      action: "CREATE",
      actorName,
      actorRole,
      reason: "Pembuatan formulir pendaftaran LOTO baru melalui wizard",
      diffAfter: {
        caseNumber: newCase.caseNumber,
        kks: newCase.kks,
        namaPeralatan: newCase.namaPeralatan,
        status: newCase.status,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error: any) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Gagal membuat pengajuan LOTO", details: error.message },
      { status: 500 }
    );
  }
}
