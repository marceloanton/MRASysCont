"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { createSettlement } from "@/lib/phase3/settlement-repository";
import {
  isSettlementDirection,
  validatePositiveAmount
} from "@/lib/phase3/validation";

export type SettlementFormState = {
  message: string;
  ok: boolean;
};

const initialState: SettlementFormState = {
  message: "",
  ok: false
};

function amountFromForm(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function createSettlementAction(
  _previousState: SettlementFormState = initialState,
  formData: FormData
): Promise<SettlementFormState> {
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

  if (!tenant.membership.permissions.issueInvoices) {
    return {
      ok: false,
      message: "No tenes permiso para registrar cobros/pagos."
    };
  }

  const thirdPartyId = String(formData.get("thirdPartyId") ?? "");
  const directionValue = String(formData.get("direction") ?? "");
  const date = new Date(String(formData.get("date") ?? ""));
  const currency = String(formData.get("currency") ?? "ARS").trim().toUpperCase();
  const amount = amountFromForm(formData.get("amount"));
  const method = String(formData.get("method") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const treasuryAccountId = String(formData.get("treasuryAccountId") ?? "").trim();

  if (
    !thirdPartyId ||
    !isSettlementDirection(directionValue) ||
    Number.isNaN(date.getTime()) ||
    !method
  ) {
    return {
      ok: false,
      message: "Tercero, operacion, fecha y metodo son obligatorios."
    };
  }

  if (!validatePositiveAmount(amount)) {
    return {
      ok: false,
      message: "El importe debe ser mayor a cero."
    };
  }

  const result = await createSettlement({
    companyId: tenant.company.id,
    thirdPartyId,
    direction: directionValue,
    date,
    currency,
    amount,
    method,
    reference,
    notes,
    treasuryAccountId: treasuryAccountId || undefined
  });

  if (result.ok) {
    recordAuditEvent({
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: directionValue === "COBRO" ? "settlement.collected" : "settlement.paid",
      entity: "Settlement",
      entityId: result.id,
      metadata: {
        thirdPartyId,
        amount,
        currency,
        treasuryAccountId: treasuryAccountId || null
      }
    });
  }

  revalidatePath("/cuentas-corrientes");
  revalidatePath("/tesoreria");

  return {
    ok: result.ok,
    message: result.message
  };
}
