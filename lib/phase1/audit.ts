import { prisma } from "../prisma";
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
  if (process.env.DATABASE_URL) {
    void prisma.auditEvent
      .create({
        data: {
          studyId: input.studyId ?? null,
          companyId: input.companyId ?? null,
          userId: input.userId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          metadata: input.metadata
        }
      })
      .catch(() => {
        // Keep in-memory audit as fallback in case DB logging fails.
      });
  }
  return event;
}

export async function listAuditEvents(studyId: string, companyId?: string) {
  if (process.env.DATABASE_URL) {
    try {
      return await prisma.auditEvent.findMany({
        where: {
          studyId,
          ...(companyId ? { companyId } : {})
        },
        orderBy: {
          occurredAt: "desc"
        },
        take: 10
      });
    } catch {
      // Fall through to in-memory fallback.
    }
  }

  const base = auditEvents.filter((event) => event.studyId === studyId);
  if (!companyId) {
    return base.slice(0, 10);
  }

  return base.filter((event) => event.companyId === companyId).slice(0, 10);
}
