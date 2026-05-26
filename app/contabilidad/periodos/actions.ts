"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { closeAccountingPeriod, createAccountingPeriod } from "@/lib/phase4-accounting/repository";
import { validatePeriodRange } from "@/lib/phase4-accounting/validation";

export type PeriodFormState = {
  message: string;
  ok: boolean;
};

const initialState: PeriodFormState = {
  message: "",
  ok: false
};

export async function createPeriodAction(
  _previousState: PeriodFormState = initialState,
  formData: FormData
): Promise<PeriodFormState> {
  void _previousState;

  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return {
      ok: false,
      message: "No hay sesion activa."
    };
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  if (!tenant.membership.permissions.manageSettings) {
    return {
      ok: false,
      message: "No tenes permiso para crear periodos."
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const startsAt = new Date(String(formData.get("startsAt") ?? ""));
  const endsAt = new Date(String(formData.get("endsAt") ?? ""));

  if (!name || !validatePeriodRange(startsAt, endsAt)) {
    return {
      ok: false,
      message: "Nombre y rango de fechas valido son obligatorios."
    };
  }

  const result = await createAccountingPeriod({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    name,
    startsAt,
    endsAt
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "accounting_period.created",
      entity: "AccountingPeriod",
      entityId: result.id,
      metadata: {
        name
      }
    });
  }

  revalidatePath("/contabilidad/periodos");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function closePeriodAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return;
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  if (!tenant.membership.permissions.manageSettings) {
    return;
  }

  const periodId = String(formData.get("periodId") ?? "");

  if (!periodId) {
    return;
  }

  const result = await closeAccountingPeriod({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    periodId
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "accounting_period.closed",
      entity: "AccountingPeriod",
      entityId: result.id
    });
  }

  revalidatePath("/contabilidad/periodos");
  revalidatePath("/contabilidad/asientos");
}
