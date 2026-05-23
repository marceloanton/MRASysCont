"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { createThirdParty } from "@/lib/phase3/repository";
import {
  isThirdPartyType,
  normalizeDocument,
  validateDocument
} from "@/lib/phase3/validation";

export type ThirdPartyFormState = {
  message: string;
  ok: boolean;
};

const initialState: ThirdPartyFormState = {
  message: "",
  ok: false
};

export async function createThirdPartyAction(
  _previousState: ThirdPartyFormState = initialState,
  formData: FormData
): Promise<ThirdPartyFormState> {
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
      message: "No tenes permiso para crear terceros."
    };
  }

  const typeValue = String(formData.get("type") ?? "");
  const legalName = String(formData.get("legalName") ?? "").trim();
  const tradeName = String(formData.get("tradeName") ?? "").trim();
  const documentType = String(formData.get("documentType") ?? "CUIT").trim();
  const document = normalizeDocument(String(formData.get("document") ?? ""));
  const taxCondition = String(formData.get("taxCondition") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!isThirdPartyType(typeValue) || !legalName || !document || !taxCondition) {
    return {
      ok: false,
      message: "Tipo, razon social, documento y condicion fiscal son obligatorios."
    };
  }

  if (!validateDocument(document)) {
    return {
      ok: false,
      message: "El documento debe ser CUIT/CUIL o DNI numerico valido."
    };
  }

  const result = await createThirdParty({
    companyId: tenant.company.id,
    type: typeValue,
    legalName,
    tradeName,
    documentType,
    document,
    taxCondition,
    email,
    phone,
    address
  });

  if (result.ok) {
    recordAuditEvent({
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "third_party.created",
      entity: "ThirdParty",
      entityId: result.id,
      metadata: {
        document,
        type: typeValue
      }
    });
  }

  revalidatePath("/terceros");

  return {
    ok: result.ok,
    message: result.message
  };
}
