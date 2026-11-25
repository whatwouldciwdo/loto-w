// POST /api/import/preview - Preview, Kolom Mapping, & Deteksi Anomali Excel
import { NextRequest, NextResponse } from "next/server";
import { parseExcelWorkbook } from "@/lib/excel-importer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File Excel (.xlsx) belum dipilih." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sheetResults = parseExcelWorkbook(buffer);

    if (sheetResults.length === 0) {
      return NextResponse.json(
        { error: "Tidak ditemukan sheet LOTO yang valid (misal: 'LOTO_2026')." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      sheets: sheetResults,
    });
  } catch (error: any) {
    console.error("Error previewing Excel import:", error);
    return NextResponse.json(
      { error: "Gagal memproses file Excel", details: error.message },
      { status: 500 }
    );
  }
}
