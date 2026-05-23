"use client";

import { useActionState } from "react";
import type { TreasuryAccountSummary } from "@/lib/phase4/types";
import { createTreasuryMovementAction, type TreasuryFormState } from "./actions";

const initialState: TreasuryFormState = {
  message: "",
  ok: false
};

export function TreasuryMovementForm({
  accounts
}: {
  accounts: TreasuryAccountSummary[];
}) {
  const [state, formAction, pending] = useActionState(
    createTreasuryMovementAction,
    initialState
  );
  const activeAccounts = accounts.filter((account) => account.active);

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="treasuryAccountId">Cuenta</label>
      <select id="treasuryAccountId" name="treasuryAccountId" required>
        {activeAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} - {account.currency}
          </option>
        ))}
      </select>

      <label htmlFor="type">Tipo</label>
      <select id="type" name="type" required defaultValue="INGRESO">
        <option value="INGRESO">Ingreso</option>
        <option value="EGRESO">Egreso</option>
        <option value="TRANSFERENCIA">Transferencia</option>
        <option value="AJUSTE">Ajuste</option>
      </select>

      <label htmlFor="date">Fecha</label>
      <input id="date" name="date" type="date" required />

      <label htmlFor="currency">Moneda</label>
      <select id="currency" name="currency" required defaultValue="ARS">
        <option>ARS</option>
        <option>USD</option>
      </select>

      <label htmlFor="amount">Importe</label>
      <input id="amount" name="amount" inputMode="decimal" required />

      <label htmlFor="description">Descripcion</label>
      <input id="description" name="description" required />

      <label htmlFor="reference">Referencia</label>
      <input id="reference" name="reference" />

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending || activeAccounts.length === 0}>
        {pending ? "Registrando..." : "Registrar movimiento"}
      </button>
    </form>
  );
}
