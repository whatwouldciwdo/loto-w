// C-LOTO Excel Import Parser
// PT PLN Indonesia Power UBP Cilegon

import * as XLSX from "xlsx";
import { RawLotoEntry, validateLotoEntry } from "./loto-validator";

export interface ParsedSheetResult {
  sheetName: string;
  totalRows: number;
  validRows: number;
  entries: (RawLotoEntry & {
    source_sheet: string;
    source_row: number;
    source_ref: string;
    issues: string[];
    formattedIssues: ReturnType<typeof validateLotoEntry>;
  })[];
  issuesCount: {
    missingDate: number;
    missingKks: number;
    activeWithReleaseDate: number;
    releaseWithoutDate: number;
    releaseBeforeStart: number;
    totalFlagged: number;
  };
}

// Convert Excel date serial or raw cell value to string
function parseCellDate(cell: any): string | null {
  if (!cell) return null;
  if (cell.t === "d" && cell.v instanceof Date) {
    return cell.v.toISOString().slice(0, 10);
  }
  if (typeof cell.v === "number" && cell.v > 25000 && cell.v < 70000) {
    try {
      const dateObj = XLSX.SSF.parse_date_code(cell.v);
      if (dateObj) {
        const y = dateObj.y;
        const m = String(dateObj.m).padStart(2, "0");
        const d = String(dateObj.d).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
    } catch {
      // fallback
    }
  }
  const s = String(cell.w || cell.v || "").trim();
  if (!s || s === "-" || s.toLowerCase() === "null") return null;
  // Match YYYY-MM-DD or DD/MM/YYYY
  const isoMatch = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }
  const idMatch = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (idMatch) {
    return `${idMatch[3]}-${idMatch[2].padStart(2, "0")}-${idMatch[1].padStart(2, "0")}`;
  }
  return s;
}

// Safe string extractor that strictly preserves leading zeros (e.g. "012", "017")
function parseCellString(cell: any): string {
  if (!cell || cell.v === undefined || cell.v === null) return "";
  // If formatted text `cell.w` exists and has leading zero or custom format, prefer it
  if (cell.w !== undefined && cell.w !== null && String(cell.w).trim() !== "") {
    return String(cell.w).trim();
  }
  return String(cell.v).trim();
}

export function parseExcelWorkbook(buffer: ArrayBuffer | Buffer): ParsedSheetResult[] {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,
    cellNF: true,
    cellText: true,
  });

  const results: ParsedSheetResult[] = [];

  for (const sheetName of workbook.SheetNames) {
    // We primarily parse LOTO_2026, LOTO_2025, LOTO_2024, DEMO_ONLY
    if (
      !sheetName.toUpperCase().includes("LOTO") &&
      !sheetName.toUpperCase().includes("DEMO")
    ) {
      continue;
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet || !worksheet["!ref"]) continue;

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    // Data starts at row index 7 (Excel row 8)
    const startRow = Math.max(range.s.r, 7);
    const endRow = range.e.r;

    const entries: ParsedSheetResult["entries"] = [];
    let currentMainEntry: (typeof entries)[0] | null = null;

    let missingDate = 0;
    let missingKks = 0;
    let activeWithReleaseDate = 0;
    let releaseWithoutDate = 0;
    let releaseBeforeStart = 0;
    let totalFlagged = 0;

    for (let r = startRow; r <= endRow; r++) {
      const getVal = (colIdx: number) => {
        const cellAddress = XLSX.utils.encode_cell({ r, c: colIdx });
        return worksheet[cellAddress];
      };

      const cellNo = getVal(0); // A: NO
      const cellShift = getVal(1); // B: Shift
      const cellTanggal = getVal(2); // C: Tanggal
      const cellKks = getVal(3); // D: No KKS
      const cellLockTag = getVal(4); // E: Nomor Lock/Tag
      const cellType = getVal(5); // F: Type
      const cellStatus = getVal(6); // G: Status
      const cellNama = getVal(7); // H: Nama Peralatan
      const cellLokasi = getVal(8); // I: Lokasi Peralatan
      const cellPeralatan = getVal(9); // J: Peralatan
      const cellBagian = getVal(10); // K: Bagian
      const cellVerifK3 = getVal(11); // L: Verifikasi K3
      const cellEksekusi = getVal(12); // M: Eksekusi
      const cellExecutor = getVal(13); // N: Executor
      const cellTglRelease = getVal(14); // O: Tanggal Release
      const cellPenormalan = getVal(15); // P: Penormalan
      const cellExecRelease = getVal(16); // Q: Executor Release
      const cellVerifRelease = getVal(17); // R: Verifikasi K3 Release
      const cellKeterangan = getVal(18); // S: Keterangan

      const noStr = parseCellString(cellNo);
      const namaStr = parseCellString(cellNama);
      const kksStr = parseCellString(cellKks);
      const statusStr = parseCellString(cellStatus);

      // Skip empty bottom rows
      if (!noStr && !namaStr && !kksStr && !statusStr) {
        continue;
      }

      // Check if this row is a continuation row of previous case (e.g. merged multi-point isolation)
      // A row is continuation if NO is empty, but Nama Peralatan or KKS is present and we have a preceding main entry
      const isContinuation = !noStr && currentMainEntry !== null && (namaStr || kksStr);

      if (isContinuation && currentMainEntry) {
        const continuationPoint = {
          source_row: r + 1,
          kks: kksStr || currentMainEntry.kks,
          nomor_lock_tag: parseCellString(cellLockTag),
          nama_peralatan: namaStr,
          eksekusi: parseCellString(cellEksekusi),
          executor: parseCellString(cellExecutor),
          penormalan: parseCellString(cellPenormalan),
        };
        currentMainEntry.detail_tambahan = currentMainEntry.detail_tambahan || [];
        currentMainEntry.detail_tambahan.push(continuationPoint);
        continue;
      }

      // Main Entry
      const entry: RawLotoEntry = {
        no: noStr || String(entries.length + 1),
        shift: parseCellString(cellShift) || "B",
        tanggal: parseCellDate(cellTanggal),
        kks: kksStr,
        nomor_lock_tag: parseCellString(cellLockTag),
        type: parseCellString(cellType) || "Other",
        status: statusStr || "Aktif",
        nama_peralatan: namaStr,
        lokasi_peralatan: parseCellString(cellLokasi),
        peralatan: parseCellString(cellPeralatan) || "Equipment",
        bagian: parseCellString(cellBagian),
        verifikasi_k3: parseCellString(cellVerifK3),
        eksekusi: parseCellString(cellEksekusi),
        executor: parseCellString(cellExecutor),
        tanggal_release: parseCellDate(cellTglRelease),
        penormalan: parseCellString(cellPenormalan),
        executor_release: parseCellString(cellExecRelease),
        verifikasi_k3_release: parseCellString(cellVerifRelease),
        keterangan: parseCellString(cellKeterangan),
        detail_tambahan: [],
      };

      const formattedIssues = validateLotoEntry(entry);
      const issueCodes = formattedIssues.map((i) => i.code);

      if (issueCodes.includes("MISSING_DATE")) missingDate++;
      if (issueCodes.includes("MISSING_KKS_OR_PLACEHOLDER")) missingKks++;
      if (issueCodes.includes("ACTIVE_HAS_RELEASE_DATE")) activeWithReleaseDate++;
      if (issueCodes.includes("RELEASE_WITHOUT_RELEASE_DATE")) releaseWithoutDate++;
      if (issueCodes.includes("RELEASE_BEFORE_START")) releaseBeforeStart++;
      if (formattedIssues.length > 0) totalFlagged++;

      const fullEntry = {
        ...entry,
        source_sheet: sheetName,
        source_row: r + 1,
        source_ref: `${sheetName}!${r + 1}`,
        issues: issueCodes,
        formattedIssues,
      };

      entries.push(fullEntry);
      currentMainEntry = fullEntry;
    }

    results.push({
      sheetName,
      totalRows: entries.length,
      validRows: entries.filter((e) => e.issues.length === 0).length,
      entries,
      issuesCount: {
        missingDate,
        missingKks,
        activeWithReleaseDate,
        releaseWithoutDate,
        releaseBeforeStart,
        totalFlagged,
      },
    });
  }

  return results;
}
