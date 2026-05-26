"use client";

import { useActionState, useState } from "react";
import type { AccountSummary, JournalEntrySummary } from "@/lib/phase4-accounting/types";
import { updateDraftJournalEntryAction, type JournalEntryFormState } from "./actions";

const initialState: JournalEntryFormState = {
  message: "",
  ok: false
};

const minimumLines = 2;

export function JournalEntryEditForm({
  accounts,
  entry
}: {
  accounts: AccountSummary[];
  entry: JournalEntrySummary;
}) {
  const [state, formAction, pending] = useActionState(
    updateDraftJournalEntryAction,
    initialState
  );
  const imputableAccounts = accounts.filter((account) => account.imputable && account.active);
  const [lineIds, setLineIds] = useState(
    entry.lines.length >= minimumLines
      ? entry.lines.map((_, index) => `existing-${entry.id}-${index}`)
      : ["line-1", "line-2"]
  );

  function addLine() {
    setLineIds((current) => [...current, crypto.randomUUID()]);
  }

  function removeLine(lineId: string) {
    setLineIds((current) =>
      current.length > minimumLines ? current.filter((id) => id !== lineId) : current
    );
  }

  return (
    <details className="draftEdit">
      <summary>Editar borrador</summary>
      <form action={formAction} className="draftEditForm">
        <input type="hidden" name="entryId" value={entry.id} />

        <label htmlFor={`date-${entry.id}`}>Fecha</label>
        <input id={`date-${entry.id}`} name="date" type="date" defaultValue={entry.date} required />

        <label htmlFor={`description-${entry.id}`}>Descripcion</label>
        <input
          id={`description-${entry.id}`}
          name="description"
          defaultValue={entry.description}
          required
        />

        <div className="entryLines">
          {lineIds.map((lineId, index) => {
            const line = entry.lines[index];

            return (
              <div className="entryLine" key={lineId}>
                <select
                  name="accountId"
                  defaultValue={line?.accountId ?? imputableAccounts[0]?.id}
                  required
                  aria-label={`Cuenta linea ${index + 1}`}
                >
                  {imputableAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </select>
                <input
                  name="debit"
                  defaultValue={line?.debit ? String(line.debit) : ""}
                  inputMode="decimal"
                  placeholder="Debe"
                  aria-label={`Debe linea ${index + 1}`}
                />
                <input
                  name="credit"
                  defaultValue={line?.credit ? String(line.credit) : ""}
                  inputMode="decimal"
                  placeholder="Haber"
                  aria-label={`Haber linea ${index + 1}`}
                />
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
            );
          })}
        </div>

        <button className="secondaryButton" type="button" onClick={addLine}>
          Agregar linea
        </button>

        {state.message ? (
          <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
        ) : null}

        <button type="submit" disabled={pending || imputableAccounts.length < 2}>
          {pending ? "Guardando..." : "Guardar borrador"}
        </button>
      </form>
    </details>
  );
}
