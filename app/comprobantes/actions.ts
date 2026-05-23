"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { createVoucher } from "@/lib/phase3/voucher-repository";
import {
  isVoucherDirection,
  isVoucherType,
  validateVoucherAmounts,
  validateVoucherNumber
} from "@/lib/phase3/validation";

export type VoucherFormState = {
  message: string;
  ok: boolean;
};

const initialState: VoucherFormState = {
  message: "",
  ok: false
};

function amountFromForm(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function createVoucherAction(
  _previousState: VoucherFormState = initialState,
  formData: FormData
): Promise<VoucherFormState> {
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
      message: "No tenes permiso para registrar comprobantes."
    };
  }

  const thirdPartyId = String(formData.get("thirdPartyId") ?? "");
  const directionValue = String(formData.get("direction") ?? "");
  const typeValue = String(formData.get("type") ?? "");
  const letter = String(formData.get("letter") ?? "").trim().toUpperCase();
  const pointOfSale = String(formData.get("pointOfSale") ?? "").trim();
  const number = String(formData.get("number") ?? "").trim();
  const issueDate = new Date(String(formData.get("issueDate") ?? ""));
  const dueDateValue = String(formData.get("dueDate") ?? "");
  const dueDate = dueDateValue ? new Date(dueDateValue) : undefined;
  const currency = String(formData.get("currency") ?? "ARS").trim().toUpperCase();
  const netAmount = amountFromForm(formData.get("netAmount"));
  const taxAmount = amountFromForm(formData.get("taxAmount"));
  const totalAmount = amountFromForm(formData.get("totalAmount"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (
    !thirdPartyId ||
    !isVoucherDirection(directionValue) ||
    !isVoucherType(typeValue) ||
    !pointOfSale ||
    !number ||
    Number.isNaN(issueDate.getTime())
  ) {
    return {
      ok: false,
      message: "Tercero, tipo, numeracion y fecha son obligatorios."
    };
  }

  if (!validateVoucherNumber(pointOfSale) || !validateVoucherNumber(number)) {
    return {
      ok: false,
      message: "Punto de venta y numero deben ser numericos."
    };
  }

  if (!validateVoucherAmounts({ netAmount, taxAmount, totalAmount })) {
    return {
      ok: false,
      message: "Los importes deben cumplir neto + impuestos = total."
    };
  }

  const result = await createVoucher({
    companyId: tenant.company.id,
    thirdPartyId,
    direction: directionValue,
    type: typeValue,
    letter,
    pointOfSale,
    number,
    issueDate,
    dueDate,
    currency,
    netAmount,
    taxAmount,
    totalAmount,
    notes
  });

  if (result.ok) {
    recordAuditEvent({
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "voucher.created",
      entity: "Voucher",
      entityId: result.id,
      metadata: {
        thirdPartyId,
        direction: directionValue,
        type: typeValue,
        number
      }
    });
  }

  revalidatePath("/comprobantes");

  return {
    ok: result.ok,
    message: result.message
  };
}
