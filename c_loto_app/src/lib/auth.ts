// C-LOTO Role-Based Access Control (RBAC)
// PT PLN Indonesia Power UBP Cilegon

export type UserRole =
  | "Operator Shift"
  | "Supervisor Shift"
  | "Maintenance Authorized Person"
  | "Verifikator K3"
  | "Admin Sistem"
  | "Auditor";

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  shift: string;
  division: string;
  nip: string;
}

// Pre-configured demo users representing each functional role
export const DEMO_USERS: AppUser[] = [
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

export const PERMISSIONS = {
  // Creating and Editing Draft LOTO
  canCreateDraft: (role: UserRole): boolean => {
    return ["Operator Shift", "Supervisor Shift", "Maintenance Authorized Person"].includes(role);
  },
  canEditDraft: (role: UserRole): boolean => {
    return ["Operator Shift", "Supervisor Shift", "Maintenance Authorized Person"].includes(role);
  },

  // Supervisor operational review & approval
  canApproveLotoSupervisor: (role: UserRole): boolean => {
    return role === "Supervisor Shift";
  },

  // Mandatory K3 Zero-Energy Verification (CRITICAL: Admin CANNOT bypass)
  canVerifyK3: (role: UserRole): boolean => {
    return role === "Verifikator K3";
  },

  // Release Workflow
  canRequestRelease: (role: UserRole): boolean => {
    return ["Maintenance Authorized Person", "Operator Shift", "Supervisor Shift"].includes(role);
  },
  canApproveReleaseSupervisor: (role: UserRole): boolean => {
    return role === "Supervisor Shift";
  },
  canApproveReleaseK3: (role: UserRole): boolean => {
    // CRITICAL: Strictly Verifikator K3. System Admin cannot bypass safety check!
    return role === "Verifikator K3";
  },
  canRecordPhysicalNormalization: (role: UserRole): boolean => {
    return ["Operator Shift", "Maintenance Authorized Person"].includes(role);
  },

  // Shift Handover
  canCreateShiftHandover: (role: UserRole): boolean => {
    return ["Operator Shift", "Supervisor Shift"].includes(role);
  },
  canAcknowledgeShiftHandover: (role: UserRole): boolean => {
    return role === "Supervisor Shift";
  },

  // Import Excel
  canImportExcel: (role: UserRole): boolean => {
    return ["Admin Sistem", "Supervisor Shift"].includes(role);
  },

  // System Administration
  canManageSettings: (role: UserRole): boolean => {
    return role === "Admin Sistem";
  },

  // Reports and Audit Trail
  canViewReports: (_role: UserRole): boolean => true,
  canExportReports: (_role: UserRole): boolean => true,
  canViewAuditTrail: (_role: UserRole): boolean => true,
};
