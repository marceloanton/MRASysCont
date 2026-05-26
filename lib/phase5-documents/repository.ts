import "server-only";

import { prisma } from "@/lib/prisma";
import { TenantAccessError } from "@/lib/phase1/tenant-access";
import type { UserRole } from "@/lib/phase1/types";
import {
  canCreateDocument,
  canDownloadDocument,
  canReadDocument,
  canReviewDocument,
  isClientRole,
  isValidDocumentStatusTransition,
  type DocumentStatus
} from "./guards";

const PERIOD_TAG_REGEX = /\[period:([^\]]+)\]/i;
const CLIENT_VISIBLE_TAG = "[client-visible]";

function assertDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new TenantAccessError("PostgreSQL no esta disponible.");
  }
}

function buildNotesWithMetadata(input: {
  notes?: string;
  period?: string;
  clientVisible?: boolean;
}) {
  const tags: string[] = [];
  if (input.period) {
    tags.push(`[period:${input.period}]`);
  }
  if (input.clientVisible) {
    tags.push(CLIENT_VISIBLE_TAG);
  }

  const noteBody = (input.notes ?? "").trim();
  if (!tags.length) {
    return noteBody || null;
  }

  return [tags.join(" "), noteBody].filter(Boolean).join(" ").trim();
}

export function parseDocumentPeriod(notes?: string | null) {
  if (!notes) {
    return null;
  }
  const match = notes.match(PERIOD_TAG_REGEX);
  if (!match?.[1]) {
    return null;
  }
  return match[1].trim() || null;
}

export function isDocumentClientVisible(document: {
  status: string;
  notes?: string | null;
}) {
  return document.status === "APPROVED" || Boolean(document.notes?.includes(CLIENT_VISIBLE_TAG));
}

async function assertClientBelongsToStudy(studyId: string, clientOfStudyId?: string | null) {
  if (!clientOfStudyId) {
    return;
  }
  const client = await prisma.clientOfStudy.findFirst({
    where: { id: clientOfStudyId, studyId },
    select: { id: true }
  });

  if (!client) {
    throw new TenantAccessError("No se puede vincular cliente de otro estudio.");
  }
}

async function assertCompanyBelongsToStudy(studyId: string, companyId?: string | null) {
  if (!companyId) {
    return;
  }

  const company = await prisma.company.findFirst({
    where: { id: companyId, studyId },
    select: { id: true }
  });
  if (!company) {
    throw new TenantAccessError("No se puede vincular empresa de otro estudio.");
  }
}

export async function createStudyDocument(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  actorCompanyId: string;
  clientOfStudyId?: string;
  companyId?: string;
  period?: string;
  title: string;
  category: string;
  notes?: string;
  visibility?: "INTERNAL" | "CLIENT_VISIBLE";
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  storageKey: string;
}) {
  assertDatabase();

  if (!canCreateDocument(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para crear documentos.");
  }
  if (!input.studyId) {
    throw new TenantAccessError("El documento requiere scope de estudio.");
  }

  await assertClientBelongsToStudy(input.studyId, input.clientOfStudyId);
  await assertCompanyBelongsToStudy(input.studyId, input.companyId);

  if (isClientRole(input.actorRole) && input.companyId && input.companyId !== input.actorCompanyId) {
    throw new TenantAccessError("El cliente no puede subir documentos fuera de su empresa activa.");
  }

  return prisma.$transaction(async (tx) => {
    const document = await tx.studyDocument.create({
      data: {
        studyId: input.studyId,
        clientOfStudyId: input.clientOfStudyId ?? null,
        companyId: input.companyId ?? input.actorCompanyId,
        title: input.title,
        category: input.category,
        notes: buildNotesWithMetadata({
          notes: input.notes,
          period: input.period,
          clientVisible: !isClientRole(input.actorRole) && input.visibility === "CLIENT_VISIBLE"
        }),
        status: "UPLOADED",
        createdByUserId: input.actorUserId
      }
    });

    await tx.studyDocumentVersion.create({
      data: {
        documentId: document.id,
        version: 1,
        storageKey: input.storageKey,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        checksumSha256: input.checksumSha256,
        createdByUserId: input.actorUserId
      }
    });

    return document;
  });
}

export async function listStudyDocuments(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  actorCompanyId: string;
  clientOfStudyId?: string;
  companyId?: string;
  period?: string;
  category?: string;
  status?: DocumentStatus;
  q?: string;
}) {
  assertDatabase();
  if (!canReadDocument(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para ver documentos.");
  }

  const whereBase = {
    studyId: input.studyId,
    ...(input.clientOfStudyId ? { clientOfStudyId: input.clientOfStudyId } : {}),
    ...(input.companyId ? { companyId: input.companyId } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.status ? { status: input.status } : {})
  };

  const qFilter = input.q
    ? {
        OR: [
          { title: { contains: input.q, mode: "insensitive" as const } },
          { category: { contains: input.q, mode: "insensitive" as const } },
          { notes: { contains: input.q, mode: "insensitive" as const } }
        ]
      }
    : {};

  const roleFilter = isClientRole(input.actorRole)
    ? {
        companyId: input.actorCompanyId
      }
    : {};

  const docs = await prisma.studyDocument.findMany({
    where: {
      ...whereBase,
      ...qFilter,
      ...roleFilter
    },
    include: {
      clientOfStudy: { select: { legalName: true } },
      company: { select: { legalName: true } },
      createdByUser: { select: { name: true } },
      reviewedByUser: { select: { name: true } },
      accessLogs: {
        orderBy: { occurredAt: "desc" },
        take: 5
      }
    },
    orderBy: [{ createdAt: "desc" }]
  });

  const visibleDocs = docs.filter((document) => {
    if (!isClientRole(input.actorRole)) {
      return true;
    }
    return (
      document.createdByUserId === input.actorUserId ||
      isDocumentClientVisible({ status: document.status, notes: document.notes })
    );
  });

  return visibleDocs.filter((document) => {
    if (!input.period) {
      return true;
    }
    return parseDocumentPeriod(document.notes) === input.period;
  });
}

export async function getStudyDocumentById(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  actorCompanyId: string;
  documentId: string;
}) {
  assertDatabase();
  if (!canReadDocument(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para ver documentos.");
  }

  const document = await prisma.studyDocument.findFirst({
    where: {
      id: input.documentId,
      studyId: input.studyId
    }
  });

  if (!document) {
    throw new TenantAccessError("No se puede acceder al documento desde este estudio.");
  }

  if (
    isClientRole(input.actorRole) &&
    (document.companyId !== input.actorCompanyId ||
      (document.createdByUserId !== input.actorUserId &&
        !isDocumentClientVisible({ status: document.status, notes: document.notes })))
  ) {
    throw new TenantAccessError("El cliente no puede acceder a este documento.");
  }

  return document;
}

export async function updateStudyDocumentStatus(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  documentId: string;
  nextStatus: DocumentStatus;
  notes?: string;
}) {
  assertDatabase();
  if (!canReviewDocument(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para revisar documentos.");
  }

  const current = await prisma.studyDocument.findFirst({
    where: { id: input.documentId, studyId: input.studyId }
  });
  if (!current) {
    throw new TenantAccessError("No se puede acceder al documento desde este estudio.");
  }

  if (!isValidDocumentStatusTransition(current.status as DocumentStatus, input.nextStatus)) {
    throw new TenantAccessError("Transicion de estado documental invalida.");
  }

  return prisma.studyDocument.update({
    where: { id: current.id },
    data: {
      status: input.nextStatus,
      notes: input.notes ?? current.notes,
      reviewedByUserId: input.actorUserId
    }
  });
}

export async function downloadStudyDocument(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  actorCompanyId: string;
  documentId: string;
}) {
  assertDatabase();
  if (!canDownloadDocument(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para descargar documentos.");
  }

  const document = await prisma.studyDocument.findFirst({
    where: { id: input.documentId, studyId: input.studyId },
    include: {
      versions: {
        orderBy: { version: "desc" },
        take: 1
      }
    }
  });

  if (!document) {
    throw new TenantAccessError("No se puede acceder al documento desde este estudio.");
  }

  if (
    isClientRole(input.actorRole) &&
    (document.companyId !== input.actorCompanyId ||
      (document.createdByUserId !== input.actorUserId &&
        !isDocumentClientVisible({ status: document.status, notes: document.notes })))
  ) {
    throw new TenantAccessError("El cliente no puede descargar este documento.");
  }

  await prisma.studyDocumentAccessLog.create({
    data: {
      studyId: input.studyId,
      documentId: document.id,
      userId: input.actorUserId,
      action: "DOWNLOAD"
    }
  });

  return {
    document,
    latestVersion: document.versions[0] ?? null
  };
}

export async function listStudyDocumentVersions(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  actorCompanyId: string;
  documentId: string;
}) {
  assertDatabase();
  if (!canReadDocument(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para ver versiones.");
  }

  const document = await prisma.studyDocument.findFirst({
    where: { id: input.documentId, studyId: input.studyId },
    select: {
      id: true,
      companyId: true,
      createdByUserId: true,
      status: true,
      notes: true
    }
  });
  if (!document) {
    throw new TenantAccessError("No se puede acceder al documento desde este estudio.");
  }

  if (
    isClientRole(input.actorRole) &&
    (document.companyId !== input.actorCompanyId ||
      (document.createdByUserId !== input.actorUserId &&
        !isDocumentClientVisible({ status: document.status, notes: document.notes })))
  ) {
    throw new TenantAccessError("El cliente no puede acceder a versiones de este documento.");
  }

  return prisma.studyDocumentVersion.findMany({
    where: { documentId: input.documentId },
    orderBy: { version: "desc" }
  });
}

const requiredCategories = ["Factura", "Extracto", "Contrato"];

export async function listMissingStudyDocuments(input: {
  studyId: string;
  actorRole: UserRole;
  actorUserId: string;
  actorCompanyId: string;
  companyId?: string;
  period?: string;
}) {
  assertDatabase();
  if (!canReadDocument(input.actorRole)) {
    throw new TenantAccessError("El usuario no tiene permiso para ver faltantes.");
  }

  const scopeCompanyId = isClientRole(input.actorRole) ? input.actorCompanyId : input.companyId;

  const docs = await prisma.studyDocument.findMany({
    where: {
      studyId: input.studyId,
      ...(scopeCompanyId ? { companyId: scopeCompanyId } : {})
    },
    select: {
      category: true,
      notes: true,
      status: true,
      createdByUserId: true,
      companyId: true
    }
  });

  const scopedDocs = docs
    .filter((doc) => {
      if (!isClientRole(input.actorRole)) {
        return true;
      }
      return (
        doc.companyId === input.actorCompanyId &&
        (doc.createdByUserId === input.actorUserId ||
          isDocumentClientVisible({ status: doc.status, notes: doc.notes }))
      );
    })
    .filter((doc) => {
      if (!input.period) {
        return true;
      }
      return parseDocumentPeriod(doc.notes) === input.period;
    });

  const categoriesPresent = new Set(scopedDocs.map((doc) => doc.category));
  return requiredCategories
    .filter((category) => !categoriesPresent.has(category))
    .map((category) => ({
      category,
      companyId: scopeCompanyId ?? null,
      period: input.period ?? null
    }));
}
