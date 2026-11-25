// GET /api/reports/export - Export LOTO Cases to Excel (.xlsx) / CSV
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "xlsx";
    const status = searchParams.get("status") || "Semua";
    const area = searchParams.get("area") || "Semua";
    const shift = searchParams.get("shift") || "Semua";

    const where: any = {};
    if (status !== "Semua") where.status = status;
    if (shift !== "Semua") where.shift = shift;
    if (area !== "Semua") where.lokasiPeralatan = { contains: area };

    const cases = await prisma.lotoCase.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Format export rows exactly matching UBP Cilegon Logsheet CLG.05.01.31 columns
    const exportRows = cases.map((c, idx) => ({
      NO: c.no || String(idx + 1),
      Shift: c.shift || "-",
      Tanggal: c.tanggal || "-",
      "No KKS": c.kks || "-",
      "Nomor Lock/Tag": c.nomorLockTag || "-",
      Type: c.type || "-",
      Status: c.status || "-",
      "Nama Peralatan": c.namaPeralatan || "-",
      "Lokasi Peralatan": c.lokasiPeralatan || "-",
      Peralatan: c.peralatan || "-",
      Bagian: c.bagian || "-",
      "Verifikasi K3": c.verifikasiK3 || "-",
      Eksekusi: c.eksekusi || "-",
      Executor: c.executor || "-",
      "Tanggal Release": c.tanggalRelease || "-",
      Penormalan: c.penormalan || "-",
      "Executor Release": c.executorRelease || "-",
      "Verifikasi K3 Release": c.verifikasiK3Release || "-",
      Keterangan: c.keterangan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LOTO_EXPORT");

    if (format === "csv") {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csvOutput, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="C-LOTO_UBP_Cilegon_${Date.now()}.csv"`,
        },
      });
    }

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="CLG.05.01.31_LOTO_Export_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor data", details: error.message },
      { status: 500 }
    );
  }
}
