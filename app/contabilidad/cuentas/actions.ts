"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  applyAccountChartTemplate,
  createAccount,
  listAccountChartTemplates
} from "@/lib/phase4-accounting/repository";
import { isAccountType, validateAccountCode } from "@/lib/phase4-accounting/validation";

export type AccountFormState = {
  message: string;
  ok: boolean;
};

const initialState: AccountFormState = {
  message: "",
  ok: false
};

export async function createAccountAction(
  _previousState: AccountFormState = initialState,
  formData: FormData
): Promise<AccountFormState> {
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
      message: "No tenes permiso para modificar el plan de cuentas."
    };
  }

  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const imputable = formData.get("imputable") === "on";

  if (!code || !name || !isAccountType(type)) {
    return {
      ok: false,
      message: "Codigo, nombre y tipo son obligatorios."
    };
  }

  if (!validateAccountCode(code)) {
    return {
      ok: false,
      message: "El codigo debe ser numerico jerarquico, por ejemplo 1.01.001."
    };
  }

  const result = await createAccount({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    code,
    name,
    type,
    imputable
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "account.created",
      entity: "Account",
      entityId: result.id,
      metadata: {
        code,
        type
      }
    });
  }

  revalidatePath("/contabilidad/cuentas");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function applyAccountTemplateAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return;
  }

  const tenant = getActiveTenantFromCompanies(workspace.session, workspace.companies);

  if (!tenant.membership.permissions.manageSettings) {
    return;
  }

  const templateId = String(formData.get("templateId") ?? "");

  if (!templateId) {
    return;
  }

  const templates = await listAccountChartTemplates();
  const exists = templates.some((template) => template.id === templateId);

  if (!exists) {
    return;
  }

  const result = await applyAccountChartTemplate({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    templateId
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "account.template_applied",
      entity: "AccountTemplate",
      entityId: templateId,
      metadata: {
        templateId
      }
    });
  }

  revalidatePath("/contabilidad/cuentas");
}
