"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  confirmJournalEntry,
  createJournalEntry,
  deleteDraftJournalEntry,
  listAccountingPeriods,
  listAccounts,
  reverseJournalEntry,
  updateDraftJournalEntry
} from "@/lib/phase4-accounting/repository";
import {
  validateBalancedEntry,
  validateEntryAccountsBelongToCompany,
  validateOpenPeriod
} from "@/lib/phase4-accounting/validation";
import type { JournalEntryLineInput } from "@/lib/phase4-accounting/types";

export type JournalEntryFormState = {
  message: string;
  ok: boolean;
};

const initialState: JournalEntryFormState = {
  message: "",
  ok: false
};

function numberFromForm(value: FormDataEntryValue | null) {
  const parsed = Number(String(value ?? "0").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function journalLinesFromForm(formData: FormData): JournalEntryLineInput[] {
  const accountIds = formData.getAll("accountId");
  const debitValues = formData.getAll("debit");
  const creditValues = formData.getAll("credit");

  return accountIds
    .map((accountId, index) => ({
      accountId: String(accountId ?? ""),
      debit: numberFromForm(debitValues[index] ?? null),
      credit: numberFromForm(creditValues[index] ?? null)
    }))
    .filter((line) => line.accountId && (line.debit > 0 || line.credit > 0));
}

export async function createJournalEntryAction(
  _previousState: JournalEntryFormState = initialState,
  formData: FormData
): Promise<JournalEntryFormState> {
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

  if (!tenant.membership.permissions.postAccounting) {
    return {
      ok: false,
      message: "No tenes permiso para cargar asientos."
    };
  }

  const periodId = String(formData.get("periodId") ?? "");
  const date = new Date(String(formData.get("date") ?? ""));
  const description = String(formData.get("description") ?? "").trim();
  const lines = journalLinesFromForm(formData);

  if (!periodId || Number.isNaN(date.getTime()) || !description) {
    return {
      ok: false,
      message: "Periodo, fecha y descripcion son obligatorios."
    };
  }

  if (!validateBalancedEntry(lines)) {
    return {
      ok: false,
      message: "El asiento debe estar balanceado: debito igual a credito."
    };
  }

  const [accountsResult, periodsResult] = await Promise.all([
    listAccounts(tenant.company.studyId, tenant.company.id),
    listAccountingPeriods(tenant.company.studyId, tenant.company.id)
  ]);

  if (
    !validateEntryAccountsBelongToCompany(
      lines,
      accountsResult.accounts,
      tenant.company.id
    )
  ) {
    return {
      ok: false,
      message: "Todas las cuentas deben ser imputables y de la empresa activa."
    };
  }

  if (!validateOpenPeriod(periodId, periodsResult.periods, tenant.company.id)) {
    return {
      ok: false,
      message: "El periodo debe pertenecer a la empresa activa y estar abierto."
    };
  }

  const result = await createJournalEntry({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    periodId,
    date,
    description,
    lines
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "journal_entry.created",
      entity: "JournalEntry",
      entityId: result.id,
      metadata: {
        periodId
      }
    });
  }

  revalidatePath("/contabilidad/asientos");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function confirmJournalEntryAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return;
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  if (!tenant.membership.permissions.postAccounting) {
    return;
  }

  const entryId = String(formData.get("entryId") ?? "");

  if (!entryId) {
    return;
  }

  const result = await confirmJournalEntry({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    entryId
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "journal_entry.confirmed",
      entity: "JournalEntry",
      entityId: result.id
    });
  }

  revalidatePath("/contabilidad/asientos");
  revalidatePath("/comprobantes");
}

export async function updateDraftJournalEntryAction(
  _previousState: JournalEntryFormState = initialState,
  formData: FormData
): Promise<JournalEntryFormState> {
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

  if (!tenant.membership.permissions.postAccounting) {
    return {
      ok: false,
      message: "No tenes permiso para editar asientos."
    };
  }

  const entryId = String(formData.get("entryId") ?? "");
  const date = new Date(String(formData.get("date") ?? ""));
  const description = String(formData.get("description") ?? "").trim();
  const lines = journalLinesFromForm(formData);

  if (!entryId || Number.isNaN(date.getTime()) || !description) {
    return {
      ok: false,
      message: "Asiento, fecha y descripcion son obligatorios."
    };
  }

  if (!validateBalancedEntry(lines)) {
    return {
      ok: false,
      message: "El asiento debe estar balanceado y cada linea debe tener Debe o Haber."
    };
  }

  const accountsResult = await listAccounts(
    tenant.company.studyId,
    tenant.company.id
  );

  if (
    !validateEntryAccountsBelongToCompany(
      lines,
      accountsResult.accounts,
      tenant.company.id
    )
  ) {
    return {
      ok: false,
      message: "Todas las cuentas deben ser imputables y de la empresa activa."
    };
  }

  const result = await updateDraftJournalEntry({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    entryId,
    date,
    description,
    lines
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "journal_entry.draft_updated",
      entity: "JournalEntry",
      entityId: entryId,
      metadata: {
        lines: lines.length
      }
    });
  }

  revalidatePath("/contabilidad/asientos");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function reverseJournalEntryAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return;
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  if (!tenant.membership.permissions.postAccounting) {
    return;
  }

  const entryId = String(formData.get("entryId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!entryId || !reason) {
    return;
  }

  const result = await reverseJournalEntry({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    entryId,
    reason
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "journal_entry.reversed",
      entity: "JournalEntry",
      entityId: entryId,
      metadata: {
        reversalEntryId: result.id ?? null,
        reason
      }
    });
  }

  revalidatePath("/contabilidad/asientos");
}

export async function deleteDraftJournalEntryAction(formData: FormData) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return;
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  if (!tenant.membership.permissions.postAccounting) {
    return;
  }

  const entryId = String(formData.get("entryId") ?? "");

  if (!entryId) {
    return;
  }

  const result = await deleteDraftJournalEntry({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    entryId
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: workspace.session.user.id,
      companyId: tenant.company.id,
      action: "journal_entry.draft_deleted",
      entity: "JournalEntry",
      entityId: entryId
    });
  }

  revalidatePath("/contabilidad/asientos");
}
