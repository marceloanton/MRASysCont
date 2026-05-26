import type { UserRole } from "@/lib/phase1/types";

export type DocumentStatus =
  | "UPLOADED"
  | "PENDING_REVIEW"
  | "OBSERVED"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

const transitionMap: Record<DocumentStatus, DocumentStatus[]> = {
  UPLOADED: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["OBSERVED", "APPROVED", "REJECTED"],
  OBSERVED: ["PENDING_REVIEW"],
  APPROVED: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  ARCHIVED: []
};

export function canCreateDocument(role: UserRole) {
  return role === "CONTADOR" || role === "ASISTENTE" || role === "CLIENTE";
}

export function canReviewDocument(role: UserRole) {
  return role === "CONTADOR" || role === "ASISTENTE";
}

export function canReadDocument(role: UserRole) {
  return role === "CONTADOR" || role === "ASISTENTE" || role === "CLIENTE";
}

export function canDownloadDocument(role: UserRole) {
  return role === "CONTADOR" || role === "ASISTENTE" || role === "CLIENTE";
}

export function isClientRole(role: UserRole) {
  return role === "CLIENTE";
}

export function isValidDocumentStatusTransition(
  currentStatus: DocumentStatus,
  nextStatus: DocumentStatus
) {
  return transitionMap[currentStatus].includes(nextStatus);
}
