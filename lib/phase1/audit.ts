import type { AuditEventInput } from "./types";

export type AuditEvent = AuditEventInput & {
  id: string;
  occurredAt: string;
};

const auditEvents: AuditEvent[] = [];

export function recordAuditEvent(input: AuditEventInput): AuditEvent {
  const event: AuditEvent = {
    ...input,
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString()
  };

  auditEvents.unshift(event);
  return event;
}

export function listAuditEvents(companyId?: string) {
  if (!companyId) {
    return auditEvents.slice(0, 10);
  }

  return auditEvents
    .filter((event) => event.companyId === companyId)
    .slice(0, 10);
}
