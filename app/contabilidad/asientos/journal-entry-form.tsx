"use client";

import { useActionState, useState } from "react";
import type { AccountingPeriodSummary, AccountSummary } from "@/lib/phase2/types";
import { createJournalEntryAction, type JournalEntryFormState } from "./actions";

const initialState: JournalEntryFormState = {
  message: "",
  ok: false
};

const minimumLines = 2;

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
  const [lineIds, setLineIds] = useState([crypto.randomUUID(), crypto.randomUUID()]);

  function addLine() {
    setLineIds((current) => [...current, crypto.randomUUID()]);
  }

  function removeLine(lineId: string) {
    setLineIds((current) =>
      current.length > minimumLines ? current.filter((id) => id !== lineId) : current
    );
  }

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
        {lineIds.map((lineId, index) => (
          <div className="entryLine" key={lineId}>
            <select name="accountId" required aria-label={`Cuenta linea ${index + 1}`}>
              {imputableAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
            <input name="debit" inputMode="decimal" placeholder="Debe" aria-label={`Debe linea ${index + 1}`} />
            <input name="credit" inputMode="decimal" placeholder="Haber" aria-label={`Haber linea ${index + 1}`} />
            <button
              className="lineRemoveButton"
              type="button"
              onClick={() => removeLine(lineId)}
              disabled={lineIds.length <= minimumLines}
              aria-label={`Quitar linea ${index + 1}`}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <button className="secondaryButton" type="button" onClick={addLine}>
        Agregar linea
      </button>

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending || openPeriods.length === 0 || imputableAccounts.length < 2}>
        {pending ? "Creando..." : "Crear asiento borrador"}
      </button>
    </form>
  );
}
