import type { UserRole } from "@/lib/phase1/types";

export type MonthlyStatusState =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "WAITING_DOCUMENTATION"
  | "IN_REVIEW"
  | "READY"
  | "CLOSED"
  | "OBSERVED";

export function canCreateClient(role: UserRole) {
  return role === "CONTADOR";
}

export function canAssignInternalResponsible(role: UserRole) {
  return role === "CONTADOR";
}

export function canManageDeadlines(role: UserRole) {
  return role === "CONTADOR";
}

export function canReadAllTasks(role: UserRole) {
  return role === "CONTADOR";
}

export function canCreateTask(role: UserRole) {
  return role === "CONTADOR" || role === "ASISTENTE";
}

export function isValidMonthlyStatusTransition(
  from: MonthlyStatusState,
  to: MonthlyStatusState
) {
  const allowed: Record<MonthlyStatusState, MonthlyStatusState[]> = {
    NOT_STARTED: ["IN_PROGRESS"],
    IN_PROGRESS: ["WAITING_DOCUMENTATION", "IN_REVIEW"],
    WAITING_DOCUMENTATION: ["IN_PROGRESS"],
    IN_REVIEW: ["READY", "OBSERVED"],
    READY: ["CLOSED"],
    CLOSED: [],
    OBSERVED: ["IN_PROGRESS"]
  };

  return allowed[from].includes(to);
}
