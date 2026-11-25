// C-LOTO Database Seeder
// PT PLN Indonesia Power UBP Cilegon

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    id: "usr-spv-01",
    username: "spv_operasi",
    name: "Agus Prasetyo, S.T.",
    role: "Supervisor Shift",
    shift: "Shift B",
    division: "Operasi PLTGU",
    nip: "891234567P",
  },
  {
    id: "usr-op-01",
    username: "operator_shift",
    name: "Rudi Hermawan",
    role: "Operator Shift",
    shift: "Shift B",
    division: "Operasi Turbin & HRSG",
    nip: "931234588P",
  },
  {
    id: "usr-k3-01",
    username: "k3_verifier",
    name: "Dedi Kurniawan, S.K.M.",
    role: "Verifikator K3",
    shift: "Shift B",
    division: "Tim K3 & Keselamatan Kerja",
    nip: "861234991K",
  },
  {
    id: "usr-maint-01",
    username: "maint_pic",
    name: "Bambang Wijaya, A.Md.",
    role: "Maintenance Authorized Person",
    shift: "Shift B",
    division: "Pemeliharaan Mesin & Boiler",
    nip: "911234512M",
  },
  {
    id: "usr-admin-01",
    username: "admin_sistem",
    name: "Fajar Nugraha (IT Admin)",
    role: "Admin Sistem",
    shift: "Normal",
    division: "Teknologi Informasi & Sistem",
    nip: "941234900I",
  },
  {
    id: "usr-auditor-01",
    username: "auditor_k3",
    name: "Siti Rahmawati, S.T., M.K.K.K.",
    role: "Auditor",
    shift: "Normal",
    division: "Divisi Kepatuhan & Audit Internal",
    nip: "871234120A",
  },
];

function determineUnit(lokasi = "", peralatan = "") {
  const s = (lokasi + " " + peralatan).toUpperCase();
  if (s.includes("GT 1.1") || s.includes("GT11") || s.includes("GAS TURBINE 1.1")) return "GT 1.1";
  if (s.includes("GT 1.2") || s.includes("GT12") || s.includes("GAS TURBINE 1.2")) return "GT 1.2";
  if (s.includes("ST") || s.includes("STEAM TURBINE") || s.includes("ST 1.0")) return "ST 1.0";
  if (s.includes("HRSG 1.1") || s.includes("BOILER 1.1")) return "HRSG 1.1";
  if (s.includes("HRSG 1.2") || s.includes("BOILER 1.2")) return "HRSG 1.2";
  if (s.includes("DEMIN") || s.includes("WTP") || s.includes("WATER TREATMENT")) return "BOP (Demin)";
  return "BOP / Common";
}

async function main() {
  console.log("🌱 Memulai proses seeding C-LOTO UBP Cilegon...");

  // 1. Seed Users
  console.log("Creating default RBAC users...");
  for (const u of DEMO_USERS) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: u,
      create: u,
    });
  }

  // Clear existing cases to ensure clean idempotent seed
  await prisma.isolationPoint.deleteMany();
  await prisma.k3Verification.deleteMany();
  await prisma.releaseRequest.deleteMany();
  await prisma.auditTrail.deleteMany();
  await prisma.shiftHandover.deleteMany();
  await prisma.lotoCase.deleteMany();

  // 2. Load converted or demo data
  let casesData = [];
  const convertedPath = path.resolve(__dirname, "../../loto/private/converted/loto_2026.json");
  const demoPath = path.resolve(__dirname, "../../loto/data/demo/loto_demo.json");

  let sourceFile = "";
  if (fs.existsSync(convertedPath)) {
    const raw = JSON.parse(fs.readFileSync(convertedPath, "utf-8"));
    casesData = raw.cases || [];
    sourceFile = "loto_2026.json";
    console.log(`Loaded ${casesData.length} entries from ${convertedPath}`);
  } else if (fs.existsSync(demoPath)) {
    const raw = JSON.parse(fs.readFileSync(demoPath, "utf-8"));
    casesData = raw.cases || [];
    sourceFile = "loto_demo.json";
    console.log(`Loaded ${casesData.length} entries from ${demoPath}`);
  }

  // 3. Insert Loto Cases
  console.log(`Inserting LOTO cases into database...`);
  let index = 1;
  for (const c of casesData) {
    const caseNum = `LOTO-2026-${String(index).padStart(4, "0")}`;
    const isSpecialCase31 = index === 31 || c.kks === "10MAA10AA001";
    const isSpecialCase28 = index === 28 || c.kks === "10GCB01-AA002";

    const unit = isSpecialCase31 ? "HRSG 1.1" : determineUnit(c.lokasi_peralatan, c.nama_peralatan);
    const status = isSpecialCase31
      ? "Aktif"
      : isSpecialCase28
      ? "Permintaan Release"
      : c.status === "Aktif"
      ? "Aktif"
      : c.status === "Release"
      ? "Release"
      : "Draft";

    const namaPeralatan = isSpecialCase31
      ? "High Pressure Main Steam Stop Valve"
      : isSpecialCase28
      ? "Demin Water Supply Header & Booster Pump #1 Isolation"
      : c.nama_peralatan || "Peralatan #" + index;

    const kks = isSpecialCase31 ? "10MAA10AA001" : isSpecialCase28 ? "10GCB01-AA002" : String(c.kks || "DEMO-KKS-" + index);
    const lockTag = isSpecialCase31 ? "031" : isSpecialCase28 ? "028" : String(c.nomor_lock_tag || "TAG-" + index);

    const createdCase = await prisma.lotoCase.create({
      data: {
        caseNumber: caseNum,
        sourceSheet: c.source_sheet || "LOTO_2026",
        sourceRow: c.source_row || index + 7,
        sourceRef: c.source_ref || `LOTO_2026!${index + 7}`,
        no: c.no !== undefined && c.no !== null ? String(c.no) : String(index),
        shift: isSpecialCase31 ? "B" : c.shift || "B",
        tanggal: isSpecialCase31 ? "2026-01-11" : c.tanggal || "2026-01-10",
        kks: kks,
        nomorLockTag: lockTag,
        type: c.type || "WO CM",
        status: status,
        historicalStatus: c.status || (isSpecialCase31 ? "Aktif" : "Release"),
        namaPeralatan: namaPeralatan,
        lokasiPeralatan: isSpecialCase31 ? "HRSG 1.1 Turbine Island" : c.lokasi_peralatan || unit,
        unit: unit,
        peralatan: isSpecialCase31 ? "Valve" : c.peralatan || "Equipment",
        bagian: isSpecialCase31 ? "Har Mesin" : c.bagian || "Operasi",
        energyTypes: JSON.stringify(isSpecialCase31 ? ["Termal", "Mekanik", "Hidrolik"] : ["Listrik", "Mekanik"]),
        workOrderNumber: isSpecialCase31 ? "WO-2026-108821" : isSpecialCase28 ? "WO-2026-107709" : `WO-2026-${index + 1000}`,
        eksekusi: isSpecialCase31 ? "Close, Manual Wheel Locked & Hydraulic Dumped" : c.eksekusi || "OFF / Roll Out",
        executor: isSpecialCase31 ? "Bambang Wijaya, Hendra" : c.executor || "Teknisi Operasi",
        verifikasiK3: isSpecialCase31 ? "Dedi Kurniawan, S.K.M." : c.verifikasi_k3 || "Verifikator K3",
        tanggalRelease: status === "Release" ? (c.tanggal_release || "2026-01-20") : null,
        penormalan: status === "Release" ? (c.penormalan || "Normalisasi Breaker & Valve") : null,
        executorRelease: status === "Release" ? (c.executor_release || "Edi, Eiji") : null,
        verifikasiK3Release: status === "Release" ? (c.verifikasi_k3_release || "Mansur") : null,
        keterangan: isSpecialCase31
          ? "Isolasi mekanik dan de-energisasi sistem suplai uap tekanan tinggi (102 Bar, 538°C) menuju turbin uap Steam Turbine Generator #10. Proteksi penuh overhaul flange gasket."
          : c.keterangan || "",
        issues: JSON.stringify(c.issues || []),
        detailTambahan: JSON.stringify(c.detail_tambahan || []),
        sopValidationPending: (c.issues || []).length > 0,
      },
    });

    if (isSpecialCase31) {
      // 3 Isolation points for LOTO-2026-0031 matching Stitch design
      await prisma.isolationPoint.createMany({
        data: [
          {
            caseId: createdCase.id,
            pointNumber: 1,
            pointName: "HP Main Steam Stop Valve Manual Handwheel",
            kksCode: "10MAA10AA001-V01",
            energyType: "Termal",
            isolationMethod: "Closed, Chain Padlocked #LB-031A",
            padlockNumber: "031A",
            tagNumber: "TAG-031-1",
            isZeroEnergyVerified: true,
            verificationMethod: "Zero steam pressure confirmed via 10MAA10CP001 (0.00 Bar)",
            normalized: false,
          },
          {
            caseId: createdCase.id,
            pointNumber: 2,
            pointName: "Hydraulic Actuator Trip & Supply Solenoid Breaker",
            kksCode: "10MAA10AA001-E01",
            energyType: "Listrik",
            isolationMethod: "Circuit Breaker OFF, Padlocked #LB-031B",
            padlockNumber: "031B",
            tagNumber: "TAG-031-2",
            isZeroEnergyVerified: true,
            verificationMethod: "Multimeter test 0V AC/DC at control terminal",
            normalized: false,
          },
          {
            caseId: createdCase.id,
            pointNumber: 3,
            pointName: "Hydraulic Supply Oil Manual Isolation Valve",
            kksCode: "10MAA10AA001-H01",
            energyType: "Hidrolik",
            isolationMethod: "Closed & Tagged, Pressure Relief Valve Opened",
            padlockNumber: "031C",
            tagNumber: "TAG-031-3",
            isZeroEnergyVerified: true,
            verificationMethod: "Hydraulic gauge bled down to 0 Bar",
            normalized: false,
          },
        ],
      });

      // Release Request for LOTO-2026-0031
      await prisma.releaseRequest.create({
        data: {
          caseId: createdCase.id,
          requestedBy: "Bambang Wijaya, A.Md.",
          requestedRole: "Maintenance Authorized Person",
          maintenanceDoneConfirmed: true,
          toolsPersonnelClearConfirmed: true,
          lockOwnerVerified: true,
          authorizedSupervisorApproval: false,
          k3ReleaseApproval: false,
          physicalNormalizationConfirmed: false,
          status: "Pending_Supervisor",
        },
      });
    } else {
      // Standard isolation point
      await prisma.isolationPoint.create({
        data: {
          caseId: createdCase.id,
          pointNumber: 1,
          pointName: `${createdCase.namaPeralatan} - Main Isolator`,
          kksCode: createdCase.kks,
          energyType: createdCase.peralatan.toLowerCase().includes("breaker") ? "Listrik" : "Mekanik",
          isolationMethod: createdCase.eksekusi || "Isolasi Terkunci",
          padlockNumber: `PLN-LB-${String(createdCase.nomorLockTag).padStart(3, "0")}`,
          tagNumber: `TAG-${String(createdCase.nomorLockTag).padStart(3, "0")}`,
          isZeroEnergyVerified: true,
          verificationMethod: "Pengujian multi-meter dan pemeriksaan visual",
          normalized: status === "Release",
          normalizedAt: status === "Release" ? new Date() : null,
        },
      });
    }

    // Seed K3 verification
    await prisma.k3Verification.create({
      data: {
        caseId: createdCase.id,
        verifierName: c.verifikasi_k3 || "Dedi Kurniawan, S.K.M.",
        verifierRole: "Verifikator K3",
        verifierNip: "861234991K",
        zeroEnergyConfirmed: true,
        padlockSecured: true,
        dangerTagAffixed: true,
        areaClear: true,
        checklistNotes: "Pemeriksaan isolasi fisik dan nol energi terverifikasi sesuai SOP CLG.05.01.31.",
        signatureEvidence: `SIGN-VERIF-${caseNum}`,
        status: "Approved",
      },
    });

    index++;
  }

  // 4. Shift Handover initial record
  await prisma.shiftHandover.create({
    data: {
      handoverDate: "2026-01-12",
      outgoingShift: "Shift B",
      incomingShift: "Shift C",
      outgoingSupervisor: "Agus Prasetyo, S.T.",
      incomingSupervisor: "Budi Santoso, S.T.",
      activeCasesCount: 31,
      activeCasesSnapshot: JSON.stringify({
        totalActive: 31,
        criticalCases: ["LOTO-2026-0031", "LOTO-2026-0028"],
        notes: "Semua titik isolasi dalam kondisi aman dan terpasang padlock gembok fisik. Pemeriksaan nol energi diverifikasi.",
      }),
      specialNotes: "Perhatikan LOTO-2026-0031 (HP Stop Valve HRSG 1.1): pekerjaan overhaul flange telah selesai fisik, permohonan release menunggu verifikasi verifikator K3 dan penormalan fisik shift berikutnya.",
      safetyIncidents: "Nihil - Zero Accident",
      status: "Acknowledged",
      acknowledgedAt: new Date(),
    },
  });

  // 5. Record Audit Trail
  await prisma.auditTrail.create({
    data: {
      entityType: "SYSTEM_SETTING",
      entityId: "SYS-INIT",
      action: "IMPORT_EXCEL",
      actorName: "Fajar Nugraha (IT Admin)",
      actorRole: "Admin Sistem",
      reason: "Inisialisasi sistem C-LOTO dan snapshot awal logsheet CLG.05.01.31 UBP Cilegon (174 kasus)",
      diffAfter: JSON.stringify({ totalCases: casesData.length, sourceFile }),
      ipAddress: "10.14.22.10",
    },
  });

  console.log("✅ Seeding database C-LOTO selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
