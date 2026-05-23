"use client";

import { useActionState } from "react";
import type { ThirdPartySummary } from "@/lib/phase3/types";
import type { TreasuryAccountSummary } from "@/lib/phase4/types";
import { createSettlementAction, type SettlementFormState } from "./actions";

const initialState: SettlementFormState = {
  message: "",
  ok: false
};

export function SettlementForm({
  thirdParties,
  treasuryAccounts
}: {
  thirdParties: ThirdPartySummary[];
  treasuryAccounts: TreasuryAccountSummary[];
}) {
  const [state, formAction, pending] = useActionState(
    createSettlementAction,
    initialState
  );
  const activeThirdParties = thirdParties.filter((thirdParty) => thirdParty.active);
  const activeTreasuryAccounts = treasuryAccounts.filter((account) => account.active);

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="thirdPartyId">Tercero</label>
      <select id="thirdPartyId" name="thirdPartyId" required>
        {activeThirdParties.map((thirdParty) => (
          <option key={thirdParty.id} value={thirdParty.id}>
            {thirdParty.legalName} - {thirdParty.document}
          </option>
        ))}
      </select>

      <label htmlFor="direction">Operacion</label>
      <select id="direction" name="direction" required defaultValue="COBRO">
        <option value="COBRO">Cobro</option>
        <option value="PAGO">Pago</option>
      </select>

      <label htmlFor="date">Fecha</label>
      <input id="date" name="date" type="date" required />

      <label htmlFor="currency">Moneda</label>
      <select id="currency" name="currency" defaultValue="ARS" required>
        <option>ARS</option>
        <option>USD</option>
      </select>

      <label htmlFor="amount">Importe</label>
      <input id="amount" name="amount" inputMode="decimal" required />

      <label htmlFor="method">Metodo</label>
      <select id="method" name="method" defaultValue="Transferencia" required>
        <option>Transferencia</option>
        <option>Efectivo</option>
        <option>Cheque</option>
        <option>Tarjeta</option>
        <option>Otro</option>
      </select>

      <label htmlFor="treasuryAccountId">Caja / banco</label>
      <select id="treasuryAccountId" name="treasuryAccountId" defaultValue="">
        <option value="">No vincular tesoreria</option>
        {activeTreasuryAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.name} - {account.currency}
          </option>
        ))}
      </select>

      <label htmlFor="reference">Referencia</label>
      <input id="reference" name="reference" />

      <label htmlFor="notes">Notas</label>
      <input id="notes" name="notes" />

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending || activeThirdParties.length === 0}>
        {pending ? "Registrando..." : "Registrar cobro/pago"}
      </button>
    </form>
  );
}
