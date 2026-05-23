"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  createTreasuryAccount,
  createTreasuryMovement,
  setTreasuryMovementReconciliation
} from "@/lib/phase4/repository";
import {
  isTreasuryAccountType,
  isTreasuryMovementType,
  validateTreasuryAmount
} from "@/lib/phase4/validation";

export type TreasuryFormState = {
  message: string;
  ok: boolean;
};

const initialState: TreasuryFormState = {
  message: "",
  ok: false
};

function amountFromForm(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function createTreasuryAccountAction(
  _previousState: TreasuryFormState = initialState,
  formData: FormData
): Promise<TreasuryFormState> {
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
      message: "No tenes permiso para crear cuentas de tesoreria."
    };
  }

  const typeValue = String(formData.get("type") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "ARS").trim().toUpperCase();
  const bankName = String(formData.get("bankName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();

  if (!isTreasuryAccountType(typeValue) || !name || !currency) {
    return {
      ok: false,
      message: "Tipo, nombre y moneda son obligatorios."
    };
  }

  const result = await createTreasuryAccount({
    companyId: tenant.company.id,
    type: typeValue,
    name,
    currency,
    bankName,
    accountNumber
  });

  if (result.ok) {
    recordAuditEvent({
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "treasury_account.created",
      entity: "TreasuryAccount",
      entityId: result.id,
      metadata: {
        name,
        type: typeValue
      }
    });
  }

  revalidatePath("/tesoreria");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function createTreasuryMovementAction(
  _previousState: TreasuryFormState = initialState,
  formData: FormData
): Promise<TreasuryFormState> {
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
      message: "No tenes permiso para registrar movimientos."
    };
  }

  const treasuryAccountId = String(formData.get("treasuryAccountId") ?? "");
  const typeValue = String(formData.get("type") ?? "");
  const date = new Date(String(formData.get("date") ?? ""));
  const currency = String(formData.get("currency") ?? "ARS").trim().toUpperCase();
  const amount = amountFromForm(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();

  if (
    !treasuryAccountId ||
    !isTreasuryMovementType(typeValue) ||
    Number.isNaN(date.getTime()) ||
    !description
  ) {
    return {
      ok: false,
      message: "Cuenta, tipo, fecha y descripcion son obligatorios."
    };
  }

  if (!validateTreasuryAmount(amount)) {
    return {
      ok: false,
      message: "El importe debe ser distinto de cero."
    };
  }

  const result = await createTreasuryMovement({
    companyId: tenant.company.id,
    treasuryAccountId,
    type: typeValue,
    date,
    currency,
    amount,
    description,
    reference
  });

  if (result.ok) {
    recordAuditEvent({
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "treasury_movement.created",
      entity: "TreasuryMovement",
      entityId: result.id,
      metadata: {
        treasuryAccountId,
        type: typeValue,
        amount
      }
    });
  }

  revalidatePath("/tesoreria");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function reconcileTreasuryMovementAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return;
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  if (!tenant.membership.permissions.issueInvoices) {
    return;
  }

  const movementId = String(formData.get("movementId") ?? "");
  const reconciled = String(formData.get("reconciled") ?? "") === "true";
  const reconciledAtValue = String(formData.get("reconciledAt") ?? "");
  const reconciledAt = reconciled ? new Date(reconciledAtValue) : undefined;
  const reconciliationReference = String(
    formData.get("reconciliationReference") ?? ""
  ).trim();

  if (!movementId) {
    return;
  }

  if (reconciled && (!reconciledAt || Number.isNaN(reconciledAt.getTime()))) {
    return;
  }

  const result = await setTreasuryMovementReconciliation({
    companyId: tenant.company.id,
    movementId,
    reconciled,
    reconciledAt,
    reconciliationReference
  });

  if (result.ok) {
    recordAuditEvent({
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: reconciled
        ? "treasury_movement.reconciled"
        : "treasury_movement.unreconciled",
      entity: "TreasuryMovement",
      entityId: result.id,
      metadata: {
        reconciliationReference: reconciliationReference || null,
        reconciledAt: reconciledAtValue || null
      }
    });
  }

  revalidatePath("/tesoreria");
}
