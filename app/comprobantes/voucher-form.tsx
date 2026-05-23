"use client";

import { useActionState } from "react";
import type { ThirdPartySummary } from "@/lib/phase3/types";
import { createVoucherAction, type VoucherFormState } from "./actions";

const initialState: VoucherFormState = {
  message: "",
  ok: false
};

export function VoucherForm({ thirdParties }: { thirdParties: ThirdPartySummary[] }) {
  const [state, formAction, pending] = useActionState(
    createVoucherAction,
    initialState
  );
  const activeThirdParties = thirdParties.filter((thirdParty) => thirdParty.active);

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
      <select id="direction" name="direction" required defaultValue="EMITIDO">
        <option value="EMITIDO">Emitido</option>
        <option value="RECIBIDO">Recibido</option>
      </select>

      <label htmlFor="type">Tipo</label>
      <select id="type" name="type" required defaultValue="FACTURA">
        <option value="FACTURA">Factura</option>
        <option value="NOTA_CREDITO">Nota de credito</option>
        <option value="NOTA_DEBITO">Nota de debito</option>
        <option value="RECIBO">Recibo</option>
        <option value="OTRO">Otro</option>
      </select>

      <label htmlFor="letter">Letra</label>
      <select id="letter" name="letter" defaultValue="A">
        <option>A</option>
        <option>B</option>
        <option>C</option>
        <option>X</option>
      </select>

      <label htmlFor="pointOfSale">Punto de venta</label>
      <input id="pointOfSale" name="pointOfSale" placeholder="0001" required />

      <label htmlFor="number">Numero</label>
      <input id="number" name="number" placeholder="00000001" required />

      <label htmlFor="issueDate">Fecha emision</label>
      <input id="issueDate" name="issueDate" type="date" required />

      <label htmlFor="dueDate">Fecha vencimiento</label>
      <input id="dueDate" name="dueDate" type="date" />

      <label htmlFor="currency">Moneda</label>
      <select id="currency" name="currency" defaultValue="ARS" required>
        <option>ARS</option>
        <option>USD</option>
      </select>

      <label htmlFor="netAmount">Neto</label>
      <input id="netAmount" name="netAmount" inputMode="decimal" required />

      <label htmlFor="taxAmount">Impuestos</label>
      <input id="taxAmount" name="taxAmount" inputMode="decimal" required />

      <label htmlFor="totalAmount">Total</label>
      <input id="totalAmount" name="totalAmount" inputMode="decimal" required />

      <label htmlFor="notes">Notas</label>
      <input id="notes" name="notes" />

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending || activeThirdParties.length === 0}>
        {pending ? "Registrando..." : "Registrar comprobante"}
      </button>
    </form>
  );
}
