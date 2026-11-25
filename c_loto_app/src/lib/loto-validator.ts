// C-LOTO Anomaly Detection & Business Rules Validator
// PT PLN Indonesia Power UBP Cilegon

export interface LotoValidationIssue {
  code:
    | "MISSING_DATE"
    | "MISSING_KKS_OR_PLACEHOLDER"
    | "ACTIVE_HAS_RELEASE_DATE"
    | "RELEASE_WITHOUT_RELEASE_DATE"
    | "RELEASE_BEFORE_START"
    | "MISSING_EQUIPMENT_NAME"
    | "MISSING_ISOLATION_ACTION"
    | "MULTIPLE_ISOLATION_POINTS";
  label: string;
  severity: "error" | "warning" | "info";
  description: string;
}

export interface RawLotoEntry {
  no?: string | null;
  shift?: string | null;
  tanggal?: string | null;
  kks?: string | null;
  nomor_lock_tag?: string | null;
  type?: string | null;
  status?: string | null;
  nama_peralatan?: string | null;
  lokasi_peralatan?: string | null;
  peralatan?: string | null;
  bagian?: string | null;
  verifikasi_k3?: string | null;
  eksekusi?: string | null;
  executor?: string | null;
  tanggal_release?: string | null;
  penormalan?: string | null;
  executor_release?: string | null;
  verifikasi_k3_release?: string | null;
  keterangan?: string | null;
  detail_tambahan?: any[];
}

export function validateLotoEntry(entry: RawLotoEntry): LotoValidationIssue[] {
  const issues: LotoValidationIssue[] = [];

  // 1. Check Missing Date
  if (!entry.tanggal || String(entry.tanggal).trim() === "") {
    issues.push({
      code: "MISSING_DATE",
      label: "Tanggal Kosong",
      severity: "warning",
      description: "Tanggal pemasangan atau pencatatan LOTO tidak dicantumkan pada data sumber.",
    });
  }

  // 2. Check Missing KKS or Placeholder
  const rawKks = String(entry.kks || "").trim().toUpperCase();
  if (
    !rawKks ||
    rawKks === "-" ||
    rawKks === "N/A" ||
    rawKks === "NA" ||
    rawKks === "TBD" ||
    rawKks === "NONE" ||
    rawKks === "TIDAK ADA"
  ) {
    issues.push({
      code: "MISSING_KKS_OR_PLACEHOLDER",
      label: "KKS Kosong / Placeholder",
      severity: "warning",
      description: `Nomor KKS tidak dicantumkan secara valid (ditemukan: "${entry.kks || 'kosong'}").`,
    });
  }

  // 3. Check Equipment Name
  if (!entry.nama_peralatan || String(entry.nama_peralatan).trim() === "") {
    issues.push({
      code: "MISSING_EQUIPMENT_NAME",
      label: "Nama Peralatan Kosong",
      severity: "error",
      description: "Nama peralatan wajib diisi untuk identifikasi fisik unit.",
    });
  }

  // 4. Status Consistency Checks
  const status = String(entry.status || "").trim().toLowerCase();
  const hasReleaseDate = Boolean(entry.tanggal_release && String(entry.tanggal_release).trim() !== "");

  if (status === "aktif" && hasReleaseDate) {
    issues.push({
      code: "ACTIVE_HAS_RELEASE_DATE",
      label: "Status Aktif Memiliki Tanggal Release",
      severity: "warning",
      description: `Status tercatat 'Aktif' tetapi memiliki tanggal release (${entry.tanggal_release}). Jangan otomatis ubah status tanpa konfirmasi fisik.`,
    });
  }

  if (status === "release" && !hasReleaseDate) {
    issues.push({
      code: "RELEASE_WITHOUT_RELEASE_DATE",
      label: "Release Tanpa Tanggal",
      severity: "warning",
      description: "Status tercatat 'Release' namun tanggal release tidak tertera pada data sumber.",
    });
  }

  // 5. Date comparison check
  if (entry.tanggal && entry.tanggal_release) {
    try {
      const dStart = new Date(entry.tanggal);
      const dRelease = new Date(entry.tanggal_release);
      if (!isNaN(dStart.getTime()) && !isNaN(dRelease.getTime())) {
        if (dRelease < dStart) {
          issues.push({
            code: "RELEASE_BEFORE_START",
            label: "Tanggal Release Lebih Awal",
            severity: "warning",
            description: `Tanggal release (${entry.tanggal_release}) lebih awal daripada tanggal pasang (${entry.tanggal}). Perlu verifikasi kalender sumber.`,
          });
        }
      }
    } catch {
      // Ignored if dates cannot be parsed
    }
  }

  // 6. Check multiple isolation points
  if (entry.detail_tambahan && entry.detail_tambahan.length > 0) {
    issues.push({
      code: "MULTIPLE_ISOLATION_POINTS",
      label: "Multi Titik Isolasi",
      severity: "info",
      description: `Pekerjaan ini memiliki ${entry.detail_tambahan.length + 1} titik isolasi gabungan.`,
    });
  }

  return issues;
}
