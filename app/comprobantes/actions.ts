"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { confirmJournalEntry } from "@/lib/phase4-accounting/repository";
import { buildArsAmounts } from "@/lib/phase6/fx-rules";
import { assertCommercialLicenseForBilling } from "@/lib/license";
import {
  cancelVoucher,
  createVoucher,
  getVoucherForConfirmation
} from "@/lib/phase3/voucher-repository";
import {
  isVoucherDirection,
  isVoucherType,
  validatePointOfSale,
  validateVoucherAmounts,
  validateVoucherSerial
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

  try {
    assertCommercialLicenseForBilling();
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Licencia comercial requerida."
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
  const relatedVoucherId = String(formData.get("relatedVoucherId") ?? "").trim();
  const issueDate = new Date(String(formData.get("issueDate") ?? ""));
  const dueDateValue = String(formData.get("dueDate") ?? "");
  const dueDate = dueDateValue ? new Date(dueDateValue) : undefined;
  const currency = String(formData.get("currency") ?? "ARS").trim().toUpperCase();
  const exchangeRate = amountFromForm(formData.get("exchangeRate"));
  const netAmount = amountFromForm(formData.get("netAmount"));
  const taxAmount = amountFromForm(formData.get("taxAmount"));
  const totalAmount = amountFromForm(formData.get("totalAmount"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (
    !thirdPartyId ||
    !isVoucherDirection(directionValue) ||
    !isVoucherType(typeValue) ||
    !pointOfSale ||
    Number.isNaN(issueDate.getTime())
  ) {
    return {
      ok: false,
      message: "Tercero, tipo, numeracion y fecha son obligatorios."
    };
  }

  if (!validatePointOfSale(pointOfSale)) {
    return {
      ok: false,
      message: "Formato invalido de punto de venta. Debe tener 4 digitos."
    };
  }

  // Regla fiscal: para RECIBIDO el numero lo informa el usuario; para EMITIDO se asigna al confirmar.
  if (directionValue === "RECIBIDO" && (!number || !validateVoucherSerial(number))) {
    return {
      ok: false,
      message: "Comprobante recibido: numero obligatorio de 8 digitos."
    };
  }

  if (!validateVoucherAmounts({ netAmount, taxAmount, totalAmount })) {
    return {
      ok: false,
      message: "Los importes deben cumplir neto + impuestos = total."
    };
  }

  if (currency === "USD" && !(Number.isFinite(exchangeRate) && exchangeRate > 0)) {
    return {
      ok: false,
      message: "Para comprobantes USD el tipo de cambio es obligatorio y debe ser mayor a 0."
    };
  }

  const result = await createVoucher({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    thirdPartyId,
    direction: directionValue,
    type: typeValue,
    letter,
    pointOfSale,
    number,
    relatedVoucherId: relatedVoucherId || undefined,
    issueDate,
    dueDate,
    currency,
    exchangeRate: Number.isFinite(exchangeRate) && exchangeRate > 0 ? exchangeRate : undefined,
    netAmount,
    taxAmount,
    totalAmount,
    notes
  });

  if (result.ok) {
    // Trazabilidad: dejamos constancia del comprobante y del asiento sugerido (si existe).
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "voucher.created",
      entity: "Voucher",
      entityId: result.id,
      metadata: {
        thirdPartyId,
        direction: directionValue,
        type: typeValue,
        number,
        journalEntryId: result.journalEntryId ?? null
      }
    });
    if (currency === "USD" && exchangeRate > 0) {
      const ars = buildArsAmounts({
        currency,
        exchangeRate,
        netAmount,
        taxAmount,
        totalAmount
      });
      recordAuditEvent({
        studyId: tenant.company.studyId,
        userId: workspace.session.user.id,
        companyId: tenant.company.id,
        action: "phase6.fx_entry.posted",
        entity: "Voucher",
        entityId: result.id,
        metadata: {
          originalCurrency: currency,
          originalAmount: totalAmount,
          exchangeRate,
          accountingAmountArs: Number(ars.totalArs)
        }
      });
    }
  }

  revalidatePath("/comprobantes");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function cancelVoucherAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return {
      ok: false,
      message: "No hay sesion activa."
    };
  }

  try {
    assertCommercialLicenseForBilling();
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Licencia comercial requerida."
    };
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  if (!tenant.membership.permissions.issueInvoices) {
    return {
      ok: false,
      message: "No tenes permiso para anular comprobantes."
    };
  }

  const voucherId = String(formData.get("voucherId") ?? "");

  if (!voucherId) {
    return {
      ok: false,
      message: "El comprobante es obligatorio."
    };
  }

  const result = await cancelVoucher({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    voucherId
  });

  if (result.ok) {
    // Trazabilidad: registramos la anulacion y el asiento eliminado (si aplica).
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "voucher.canceled",
      entity: "Voucher",
      entityId: result.id,
      metadata: {
        deletedJournalEntryId: result.journalEntryId ?? null
      }
    });
  }

  revalidatePath("/comprobantes");

  if (result.journalEntryId) {
    // Si se elimino un asiento borrador, refrescamos tambien la pantalla contable.
    revalidatePath("/contabilidad/asientos");
  }

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function confirmVoucherAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return {
      ok: false,
      message: "No hay sesion activa."
    };
  }

  try {
    assertCommercialLicenseForBilling();
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Licencia comercial requerida."
    };
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  // Confirmar comprobante implica confirmar asiento, por eso pedimos permiso contable.
  if (!tenant.membership.permissions.postAccounting) {
    return {
      ok: false,
      message: "No tenes permiso para confirmar comprobantes."
    };
  }

  const voucherId = String(formData.get("voucherId") ?? "");

  if (!voucherId) {
    return {
      ok: false,
      message: "El comprobante es obligatorio."
    };
  }

  const prepared = await getVoucherForConfirmation({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    voucherId
  });

  if (!prepared.ok || !prepared.journalEntryId) {
    return {
      ok: false,
      message: prepared.message
    };
  }

  // La confirmacion real sucede en el modulo contable:
  // valida asiento, asigna numeracion fiscal (si EMITIDO) y registra estado final.
  const result = await confirmJournalEntry({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    entryId: prepared.journalEntryId
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "voucher.confirmed",
      entity: "Voucher",
      entityId: voucherId,
      metadata: {
        journalEntryId: prepared.journalEntryId
      }
    });
  }

  revalidatePath("/comprobantes");
  revalidatePath("/contabilidad/asientos");

  return {
    ok: result.ok,
    message: result.message
  };
}
