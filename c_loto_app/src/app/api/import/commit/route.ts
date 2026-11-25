// POST /api/import/commit - Simpan Data Terverifikasi ke Database
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";
import { PERMISSIONS } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fileName,
      sheetName,
      entries = [],
      actorName = "Admin IT",
      actorRole = "Admin Sistem",
    } = body;

    if (!PERMISSIONS.canImportExcel(actorRole)) {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Admin Sistem atau Supervisor Shift yang dapat mengimpor data." },
        { status: 403 }
      );
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data baris yang dipilih untuk diimpor." },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let flaggedCount = 0;

    const currentCount = await prisma.lotoCase.count();

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const caseNumber = `LOTO-IMP-${String(currentCount + i + 1).padStart(4, "0")}`;

      const issuesList = e.issues || [];
      if (issuesList.length > 0) flaggedCount++;

      const unit = e.lokasi_peralatan?.includes("GT 1.1")
        ? "GT 1.1"
        : e.lokasi_peralatan?.includes("GT 1.2")
        ? "GT 1.2"
        : e.lokasi_peralatan?.includes("HRSG")
        ? "HRSG 1.1"
        : e.lokasi_peralatan?.includes("ST")
        ? "ST 1.0"
        : "BOP / Common";

      const createdCase = await prisma.lotoCase.create({
        data: {
          caseNumber,
          sourceSheet: sheetName || "IMPORT",
          sourceRow: e.source_row || i + 8,
          sourceRef: e.source_ref || `${sheetName}!${i + 8}`,
          no: e.no ? String(e.no) : String(currentCount + i + 1),
          shift: e.shift || "B",
          tanggal: e.tanggal || null,
          kks: String(e.kks || "-"),
          nomorLockTag: String(e.nomor_lock_tag || "-"),
          type: e.type || "Other",
          status: e.status || "Aktif",
          historicalStatus: e.status || null,
          namaPeralatan: e.nama_peralatan || "Peralatan Impor",
          lokasiPeralatan: e.lokasi_peralatan || unit,
          unit: unit,
          peralatan: e.peralatan || "Valve",
          bagian: e.bagian || "Operasi",
          energyTypes: JSON.stringify(["Mekanik"]),
          eksekusi: e.eksekusi || null,
          executor: e.executor || null,
          verifikasiK3: e.verifikasi_k3 || null,
          tanggalRelease: e.tanggal_release || null,
          penormalan: e.penormalan || null,
          executorRelease: e.executor_release || null,
          verifikasiK3Release: e.verifikasi_k3_release || null,
          keterangan: e.keterangan || "",
          issues: JSON.stringify(issuesList),
          detailTambahan: JSON.stringify(e.detail_tambahan || []),
          sopValidationPending: issuesList.length > 0,
        },
      });

      // Default isolation point
      await prisma.isolationPoint.create({
        data: {
          caseId: createdCase.id,
          pointNumber: 1,
          pointName: `${createdCase.namaPeralatan} - Titik Isolasi`,
          kksCode: createdCase.kks,
          energyType: "Mekanik",
          isolationMethod: createdCase.eksekusi || "Isolasi Fisik",
          padlockNumber: createdCase.nomorLockTag || "LB-IMP",
          tagNumber: `TAG-${createdCase.nomorLockTag || "IMP"}`,
          isZeroEnergyVerified: createdCase.status === "Release",
          normalized: createdCase.status === "Release",
        },
      });

      importedCount++;
    }

    // Save Import Batch Record
    const batch = await prisma.importBatch.create({
      data: {
        fileName: fileName || "Logsheet.xlsx",
        sheetName: sheetName || "LOTO_2026",
        totalRows: entries.length,
        importedCount,
        flaggedCount,
        importedBy: actorName,
        summary: `Berhasil mengimpor ${importedCount} entri (${flaggedCount} anomali ditandai untuk ditinjau).`,
      },
    });

    await logAuditEvent({
      entityType: "IMPORT_BATCH",
      entityId: batch.id,
      action: "IMPORT_EXCEL",
      actorName,
      actorRole,
      reason: `Impor batch Excel '${fileName}' selesai: ${importedCount} kasus tersimpan.`,
      diffAfter: { importedCount, flaggedCount },
    });

    return NextResponse.json({
      message: `Impor data selesai. ${importedCount} data berhasil disimpan ke database.`,
      batch,
    });
  } catch (error: any) {
    console.error("Error committing Excel import:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data impor ke database", details: error.message },
      { status: 500 }
    );
  }
}
