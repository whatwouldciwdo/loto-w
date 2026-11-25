// C-LOTO Immutable Audit Trail Logger
// PT PLN Indonesia Power UBP Cilegon

import { prisma } from "./prisma";

export interface LogAuditParams {
  caseId?: string | null;
  entityType: "LOTO_CASE" | "VERIFICATION" | "RELEASE_REQUEST" | "SHIFT_HANDOVER" | "IMPORT_BATCH" | "SYSTEM_SETTING";
  entityId: string;
  action:
    | "CREATE"
    | "UPDATE"
    | "SUBMIT_FOR_APPROVAL"
    | "APPROVE_CASE"
    | "VERIFY_K3"
    | "REQUEST_RELEASE"
    | "APPROVE_RELEASE_SUPERVISOR"
    | "APPROVE_RELEASE_K3"
    | "EXECUTE_NORMALIZATION"
    | "SHIFT_HANDOVER_SUBMIT"
    | "SHIFT_HANDOVER_ACKNOWLEDGE"
    | "IMPORT_EXCEL"
    | "DELETE_DRAFT";
  actorName: string;
  actorRole: string;
  reason?: string;
  diffBefore?: Record<string, any> | null;
  diffAfter?: Record<string, any> | null;
  ipAddress?: string;
}

export async function logAuditEvent(params: LogAuditParams) {
  try {
    return await prisma.auditTrail.create({
      data: {
        caseId: params.caseId || null,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        actorName: params.actorName,
        actorRole: params.actorRole,
        reason: params.reason || null,
        diffBefore: params.diffBefore ? JSON.stringify(params.diffBefore) : null,
        diffAfter: params.diffAfter ? JSON.stringify(params.diffAfter) : null,
        ipAddress: params.ipAddress || "127.0.0.1",
      },
    });
  } catch (error) {
    console.error("Failed to record audit trail event:", error);
    // Audit logging should not crash business operation if DB glitch occurs, but must be logged
    return null;
  }
}
