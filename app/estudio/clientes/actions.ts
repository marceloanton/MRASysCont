"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getSessionContext } from "@/lib/phase1/session";
import { getRequiredActiveTenant } from "@/lib/phase1/tenant-access";
import {
  assignClientResponsible,
  createClientOfStudy,
  updateClientMonthlyStatus
} from "@/lib/phase2/study-repository";

export type ClientFormState = {
  ok: boolean;
  message: string;
};

const initialState: ClientFormState = { ok: false, message: "" };

export async function createClientAction(
  _previousState: ClientFormState = initialState,
  formData: FormData
): Promise<ClientFormState> {
  void _previousState;
  const session = await getSessionContext();
  const tenant = getRequiredActiveTenant(session);

  const legalName = String(formData.get("legalName") ?? "").trim();
  const cuit = String(formData.get("cuit") ?? "").trim();
  if (!legalName) {
    return { ok: false, message: "Razon social obligatoria." };
  }

  try {
    const client = await createClientOfStudy({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      legalName,
      cuit
    });
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: session.user.id,
      companyId: tenant.company.id,
      action: "phase2.client.created",
      entity: "ClientOfStudy",
      entityId: client.id
    });
    revalidatePath("/estudio/clientes");
    revalidatePath("/estudio/dashboard");
    return { ok: true, message: "Cliente creado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error creando cliente." };
  }
}

export async function assignResponsibleAction(
  _previousState: ClientFormState = initialState,
  formData: FormData
): Promise<ClientFormState> {
  void _previousState;
  const session = await getSessionContext();
  const tenant = getRequiredActiveTenant(session);

  const clientOfStudyId = String(formData.get("clientOfStudyId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  if (!clientOfStudyId || !userId) {
    return { ok: false, message: "Cliente y responsable son obligatorios." };
  }

  try {
    const assignment = await assignClientResponsible({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      clientOfStudyId,
      userId
    });
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: session.user.id,
      companyId: tenant.company.id,
      action: "phase2.client.responsible_assigned",
      entity: "ClientInternalResponsible",
      entityId: assignment.id
    });
    revalidatePath("/estudio/clientes");
    return { ok: true, message: "Responsable asignado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error asignando responsable." };
  }
}

export async function updateMonthlyStatusAction(
  _previousState: ClientFormState = initialState,
  formData: FormData
): Promise<ClientFormState> {
  void _previousState;
  const session = await getSessionContext();
  const tenant = getRequiredActiveTenant(session);
  const clientOfStudyId = String(formData.get("clientOfStudyId") ?? "");
  const period = String(formData.get("period") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "");

  if (!clientOfStudyId || !period || !nextStatus) {
    return { ok: false, message: "Cliente, periodo y estado son obligatorios." };
  }

  try {
    const status = await updateClientMonthlyStatus({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: session.user.id,
      clientOfStudyId,
      period,
      nextStatus: nextStatus as never
    });
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: session.user.id,
      companyId: tenant.company.id,
      action: "phase2.client.monthly_status_updated",
      entity: "ClientMonthlyStatus",
      entityId: status.id
    });
    revalidatePath("/estudio/clientes");
    revalidatePath("/estudio/dashboard");
    return { ok: true, message: "Estado mensual actualizado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error actualizando estado mensual." };
  }
}
