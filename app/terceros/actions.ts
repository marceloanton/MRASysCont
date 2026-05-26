"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  createThirdParty,
  setThirdPartyActive,
  updateThirdParty
} from "@/lib/phase3/repository";
import {
  isThirdPartyType,
  normalizeDocument,
  validateDocument
} from "@/lib/phase3/validation";
import type { ThirdPartyType } from "@/lib/phase3/types";

export type ThirdPartyFormState = {
  message: string;
  ok: boolean;
};

const initialState: ThirdPartyFormState = {
  message: "",
  ok: false
};

function thirdPartyInputFromForm(formData: FormData) {
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
      ok: false as const,
      message: "Tipo, razon social, documento y condicion fiscal son obligatorios."
    };
  }

  if (!validateDocument(document)) {
    return {
      ok: false as const,
      message: "El documento debe ser CUIT/CUIL o DNI numerico valido."
    };
  }

  return {
    ok: true as const,
    input: {
      type: typeValue as ThirdPartyType,
      legalName,
      tradeName,
      documentType,
      document,
      taxCondition,
      email,
      phone,
      address
    }
  };
}

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

  const parsed = thirdPartyInputFromForm(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message
    };
  }

  const result = await createThirdParty({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    ...parsed.input
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "third_party.created",
      entity: "ThirdParty",
      entityId: result.id,
      metadata: {
        document: parsed.input.document,
        type: parsed.input.type
      }
    });
  }

  revalidatePath("/terceros");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function updateThirdPartyAction(
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
      message: "No tenes permiso para editar terceros."
    };
  }

  const thirdPartyId = String(formData.get("thirdPartyId") ?? "");
  const parsed = thirdPartyInputFromForm(formData);

  if (!thirdPartyId) {
    return {
      ok: false,
      message: "Falta identificar el tercero."
    };
  }

  if (!parsed.ok) {
    return {
      ok: false,
      message: parsed.message
    };
  }

  const result = await updateThirdParty({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    thirdPartyId,
    ...parsed.input
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "third_party.updated",
      entity: "ThirdParty",
      entityId: thirdPartyId,
      metadata: {
        document: parsed.input.document,
        type: parsed.input.type
      }
    });
  }

  revalidatePath("/terceros");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function setThirdPartyActiveAction(formData: FormData) {
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

  const thirdPartyId = String(formData.get("thirdPartyId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  if (!thirdPartyId) {
    return;
  }

  const result = await setThirdPartyActive({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    thirdPartyId,
    active
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: active ? "third_party.activated" : "third_party.deactivated",
      entity: "ThirdParty",
      entityId: thirdPartyId
    });
  }

  revalidatePath("/terceros");
}
