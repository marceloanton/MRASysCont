"use client";

import { useActionState } from "react";
import type { AccountingPeriodSummary, AccountSummary } from "@/lib/phase2/types";
import { createJournalEntryAction, type JournalEntryFormState } from "./actions";

const initialState: JournalEntryFormState = {
  message: "",
  ok: false
};

export function JournalEntryForm({
  accounts,
  periods
}: {
  accounts: AccountSummary[];
  periods: AccountingPeriodSummary[];
}) {
  const [state, formAction, pending] = useActionState(
    createJournalEntryAction,
    initialState
  );
  const imputableAccounts = accounts.filter((account) => account.imputable && account.active);
  const openPeriods = periods.filter((period) => period.status === "ABIERTO");

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="periodId">Periodo</label>
      <select id="periodId" name="periodId" required>
        {openPeriods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.name}
          </option>
        ))}
      </select>

      <label htmlFor="date">Fecha</label>
      <input id="date" name="date" type="date" required />

      <label htmlFor="description">Descripcion</label>
      <input id="description" name="description" required />

      <div className="entryLines">
        <div className="entryLine">
          <select name="line1AccountId" required aria-label="Cuenta linea 1">
            {imputableAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
          <input name="line1Debit" inputMode="decimal" placeholder="Debe" />
          <input name="line1Credit" inputMode="decimal" placeholder="Haber" />
        </div>

        <div className="entryLine">
          <select name="line2AccountId" required aria-label="Cuenta linea 2">
            {imputableAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
          <input name="line2Debit" inputMode="decimal" placeholder="Debe" />
          <input name="line2Credit" inputMode="decimal" placeholder="Haber" />
        </div>
      </div>

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending || openPeriods.length === 0 || imputableAccounts.length < 2}>
        {pending ? "Creando..." : "Crear asiento borrador"}
      </button>
    </form>
  );
}
