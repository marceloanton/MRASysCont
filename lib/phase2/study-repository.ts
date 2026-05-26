import "server-only";

import { prisma } from "@/lib/prisma";
import { TenantAccessError } from "@/lib/phase1/tenant-access";
import type { UserRole } from "@/lib/phase1/types";
import {
  canAssignInternalResponsible,
  canCreateClient,
  canCreateTask,
  canManageDeadlines,
  canReadAllTasks,
  isValidMonthlyStatusTransition,
  type MonthlyStatusState
} from "./study-guards";

function assertDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new TenantAccessError("PostgreSQL no esta disponible.");
  }
}

export async function createClientOfStudy(input: {
  studyId: string;
  actorRole: UserRole;
  legalName: string;
  cuit?: string;
}) {
  assertDatabase();
  if (!canCreateClient(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para crear clientes.");
  }
  if (!input.studyId) {
    throw new TenantAccessError("studyId es obligatorio.");
  }

  return prisma.clientOfStudy.create({
    data: {
      studyId: input.studyId,
      legalName: input.legalName,
      cuit: input.cuit || null,
      active: true,
      status: "ACTIVE"
    }
  });
}

export async function listClientsOfStudy(studyId: string) {
  assertDatabase();
  return prisma.clientOfStudy.findMany({
    where: {
      studyId
    },
    orderBy: {
      legalName: "asc"
    }
  });
}

export async function assignClientResponsible(input: {
  studyId: string;
  actorRole: UserRole;
  clientOfStudyId: string;
  userId: string;
}) {
  assertDatabase();
  if (!canAssignInternalResponsible(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para asignar responsables.");
  }

  const [client, membership] = await Promise.all([
    prisma.clientOfStudy.findFirst({
      where: {
        id: input.clientOfStudyId,
        studyId: input.studyId
      },
      select: { id: true }
    }),
    prisma.studyMembership.findFirst({
      where: {
        studyId: input.studyId,
        userId: input.userId,
        status: "ACTIVE"
      },
      select: { id: true }
    })
  ]);

  if (!client) {
    throw new TenantAccessError("No se puede acceder al cliente desde este estudio.");
  }
  if (!membership) {
    throw new TenantAccessError("No se puede asignar responsable de otro estudio.");
  }

  return prisma.clientInternalResponsible.upsert({
    where: {
      studyId_clientOfStudyId: {
        studyId: input.studyId,
        clientOfStudyId: input.clientOfStudyId
      }
    },
    update: {
      userId: input.userId,
      active: true
    },
    create: {
      studyId: input.studyId,
      clientOfStudyId: input.clientOfStudyId,
      userId: input.userId,
      active: true
    }
  });
}

export async function createStudyTask(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  title: string;
  clientOfStudyId?: string;
  companyId?: string;
  assignedUserId?: string;
  dueDate?: Date;
}) {
  assertDatabase();
  if (!canCreateTask(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para crear tareas.");
  }
  if (!input.studyId) {
    throw new TenantAccessError("La tarea requiere scope de estudio.");
  }

  if (input.clientOfStudyId) {
    const client = await prisma.clientOfStudy.findFirst({
      where: { id: input.clientOfStudyId, studyId: input.studyId },
      select: { id: true }
    });
    if (!client) {
      throw new TenantAccessError("No se puede acceder al cliente desde este estudio.");
    }
  }

  if (input.companyId) {
    const company = await prisma.company.findFirst({
      where: { id: input.companyId, studyId: input.studyId },
      select: { id: true }
    });
    if (!company) {
      throw new TenantAccessError("La empresa no pertenece al estudio activo.");
    }
  }

  if (input.assignedUserId) {
    const assignee = await prisma.studyMembership.findFirst({
      where: {
        studyId: input.studyId,
        userId: input.assignedUserId,
        status: "ACTIVE"
      },
      select: { id: true }
    });
    if (!assignee) {
      throw new TenantAccessError("No se puede asignar usuario de otro estudio.");
    }
  }

  return prisma.studyTask.create({
    data: {
      studyId: input.studyId,
      clientOfStudyId: input.clientOfStudyId ?? null,
      companyId: input.companyId ?? null,
      title: input.title,
      status: "PENDING",
      assignedUserId: input.assignedUserId ?? null,
      createdByUserId: input.actorUserId,
      dueDate: input.dueDate ?? null
    }
  });
}

export async function listStudyTasks(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
}) {
  assertDatabase();
  return prisma.studyTask.findMany({
    where: canReadAllTasks(input.actorRole)
      ? { studyId: input.studyId }
      : { studyId: input.studyId, assignedUserId: input.actorUserId },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }]
  });
}

export async function createStudyDeadline(input: {
  studyId: string;
  actorRole: UserRole;
  clientOfStudyId: string;
  companyId?: string;
  title: string;
  dueDate: Date;
}) {
  assertDatabase();
  if (!canManageDeadlines(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para crear vencimientos.");
  }
  if (!input.studyId) {
    throw new TenantAccessError("El vencimiento requiere scope de estudio.");
  }

  const client = await prisma.clientOfStudy.findFirst({
    where: { id: input.clientOfStudyId, studyId: input.studyId },
    select: { id: true }
  });
  if (!client) {
    throw new TenantAccessError("No se puede acceder al cliente desde este estudio.");
  }

  if (input.companyId) {
    const company = await prisma.company.findFirst({
      where: { id: input.companyId, studyId: input.studyId },
      select: { id: true }
    });
    if (!company) {
      throw new TenantAccessError("La empresa no pertenece al estudio activo.");
    }
  }

  return prisma.studyDeadline.create({
    data: {
      studyId: input.studyId,
      clientOfStudyId: input.clientOfStudyId,
      companyId: input.companyId ?? null,
      title: input.title,
      dueDate: input.dueDate,
      status: "SCHEDULED"
    }
  });
}

export async function listStudyDeadlines(studyId: string) {
  assertDatabase();
  return prisma.studyDeadline.findMany({
    where: { studyId },
    orderBy: [{ dueDate: "asc" }, { status: "asc" }]
  });
}

export async function updateClientMonthlyStatus(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  clientOfStudyId: string;
  period: string;
  nextStatus: MonthlyStatusState;
  notes?: string;
}) {
  assertDatabase();
  if (!canCreateClient(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para actualizar estado mensual.");
  }

  const client = await prisma.clientOfStudy.findFirst({
    where: { id: input.clientOfStudyId, studyId: input.studyId },
    select: { id: true }
  });
  if (!client) {
    throw new TenantAccessError("No se puede acceder al cliente desde este estudio.");
  }

  const current = await prisma.clientMonthlyStatus.findUnique({
    where: {
      studyId_clientOfStudyId_period: {
        studyId: input.studyId,
        clientOfStudyId: input.clientOfStudyId,
        period: input.period
      }
    }
  });

  const currentStatus: MonthlyStatusState = (current?.status ?? "NOT_STARTED") as MonthlyStatusState;
  if (!isValidMonthlyStatusTransition(currentStatus, input.nextStatus)) {
    throw new TenantAccessError("Transicion de estado mensual invalida.");
  }

  return prisma.clientMonthlyStatus.upsert({
    where: {
      studyId_clientOfStudyId_period: {
        studyId: input.studyId,
        clientOfStudyId: input.clientOfStudyId,
        period: input.period
      }
    },
    update: {
      status: input.nextStatus,
      notes: input.notes ?? null,
      updatedByUserId: input.actorUserId
    },
    create: {
      studyId: input.studyId,
      clientOfStudyId: input.clientOfStudyId,
      period: input.period,
      status: input.nextStatus,
      notes: input.notes ?? null,
      updatedByUserId: input.actorUserId
    }
  });
}

export async function getStudyDashboardSummary(studyId: string) {
  assertDatabase();
  const [clients, tasksOpen, deadlinesUpcoming] = await Promise.all([
    prisma.clientOfStudy.count({ where: { studyId, active: true } }),
    prisma.studyTask.count({
      where: {
        studyId,
        status: {
          in: ["PENDING", "IN_PROGRESS", "WAITING_DOCUMENTATION", "IN_REVIEW"]
        }
      }
    }),
    prisma.studyDeadline.count({
      where: {
        studyId,
        status: {
          in: ["SCHEDULED", "IN_PROGRESS", "OVERDUE"]
        }
      }
    })
  ]);

  return {
    clients,
    tasksOpen,
    deadlinesUpcoming
  };
}
