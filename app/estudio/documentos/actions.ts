"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getRequiredActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  createStudyDocument,
  downloadStudyDocument,
  updateStudyDocumentStatus
} from "@/lib/phase5-documents/repository";
import type { DocumentStatus } from "@/lib/phase5-documents/guards";

export type StudyDocumentFormState = {
  ok: boolean;
  message: string;
};

const initialState: StudyDocumentFormState = { ok: false, message: "" };

export async function createStudyDocumentAction(
  _previousState: StudyDocumentFormState = initialState,
  formData: FormData
): Promise<StudyDocumentFormState> {
  void _previousState;
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    return { ok: false, message: "No hay sesion activa." };
  }
  const tenant = getRequiredActiveTenantFromCompanies(workspace.session, workspace.companies);
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const period = String(formData.get("period") ?? "").trim();
  const clientOfStudyId = String(formData.get("clientOfStudyId") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "INTERNAL").trim() as
    | "INTERNAL"
    | "CLIENT_VISIBLE";
  const mimeType = String(formData.get("mimeType") ?? "").trim();
  const sizeBytes = Number(formData.get("sizeBytes") ?? "0");
  const checksumSha256 = String(formData.get("checksumSha256") ?? "").trim();
  const storageKey = String(formData.get("storageKey") ?? "").trim();

  if (!title || !category || !mimeType || !checksumSha256 || !storageKey || !Number.isFinite(sizeBytes)) {
    return { ok: false, message: "Completar los campos obligatorios del documento." };
  }

  try {
    const document = await createStudyDocument({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: workspace.session.user.id,
      actorCompanyId: tenant.company.id,
      title,
      category,
      notes: notes || undefined,
      period: period || undefined,
      clientOfStudyId: clientOfStudyId || undefined,
      companyId: companyId || undefined,
      visibility,
      mimeType,
      sizeBytes,
      checksumSha256,
      storageKey
    });

    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "phase5.document.created",
      entity: "StudyDocument",
      entityId: document.id
    });

    revalidatePath("/estudio/documentos");
    return { ok: true, message: "Documento registrado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error creando documento." };
  }
}

export async function updateStudyDocumentStatusAction(
  _previousState: StudyDocumentFormState = initialState,
  formData: FormData
): Promise<StudyDocumentFormState> {
  void _previousState;
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    return { ok: false, message: "No hay sesion activa." };
  }
  const tenant = getRequiredActiveTenantFromCompanies(workspace.session, workspace.companies);
  const documentId = String(formData.get("documentId") ?? "").trim();
  const nextStatus = String(formData.get("nextStatus") ?? "").trim() as DocumentStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!documentId || !nextStatus) {
    return { ok: false, message: "Documento y estado son obligatorios." };
  }

  try {
    const document = await updateStudyDocumentStatus({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: workspace.session.user.id,
      documentId,
      nextStatus,
      notes: notes || undefined
    });

    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "phase5.document.status_updated",
      entity: "StudyDocument",
      entityId: document.id
    });

    revalidatePath("/estudio/documentos");
    return { ok: true, message: "Estado actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error actualizando estado." };
  }
}

export async function downloadStudyDocumentAction(
  _previousState: StudyDocumentFormState = initialState,
  formData: FormData
): Promise<StudyDocumentFormState> {
  void _previousState;
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    return { ok: false, message: "No hay sesion activa." };
  }
  const tenant = getRequiredActiveTenantFromCompanies(workspace.session, workspace.companies);
  const documentId = String(formData.get("documentId") ?? "").trim();
  if (!documentId) {
    return { ok: false, message: "Documento obligatorio." };
  }

  try {
    const result = await downloadStudyDocument({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: workspace.session.user.id,
      actorCompanyId: tenant.company.id,
      documentId
    });
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "phase5.document.downloaded",
      entity: "StudyDocument",
      entityId: result.document.id
    });
    revalidatePath("/estudio/documentos");
    return { ok: true, message: "Descarga auditada." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error descargando documento." };
  }
}
