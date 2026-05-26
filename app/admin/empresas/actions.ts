"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { createCompany } from "@/lib/phase1/repository";
import { getSessionContext } from "@/lib/phase1/session";
import { getRequiredActiveTenant } from "@/lib/phase1/tenant-access";

export type CompanyFormState = {
  message: string;
  ok: boolean;
};

const initialState: CompanyFormState = {
  message: "",
  ok: false
};

export async function createCompanyAction(
  _previousState: CompanyFormState = initialState,
  formData: FormData
): Promise<CompanyFormState> {
  void _previousState;

  const session = await getSessionContext();
  const activeTenant = getRequiredActiveTenant(session);

  if (!activeTenant.membership.permissions.manageSettings) {
    return {
      ok: false,
      message: "No tenes permiso para crear empresas."
    };
  }

  const legalName = String(formData.get("legalName") ?? "").trim();
  const tradeName = String(formData.get("tradeName") ?? "").trim();
  const cuit = String(formData.get("cuit") ?? "").trim();
  const taxCondition = String(formData.get("taxCondition") ?? "").trim();

  if (!legalName || !cuit || !taxCondition) {
    return {
      ok: false,
      message: "Razon social, CUIT y condicion fiscal son obligatorios."
    };
  }

  const result = await createCompany({
    studyId: activeTenant.company.studyId,
    legalName,
    tradeName,
    cuit,
    taxCondition
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: activeTenant.company.studyId,
      userId: session.user.id,
      companyId: activeTenant.company.id,
      action: "company.created",
      entity: "Company",
      entityId: result.companyId,
      metadata: {
        cuit
      }
    });
  }

  revalidatePath("/admin/empresas");
  revalidatePath("/");

  return {
    ok: result.ok,
    message: result.message
  };
}
