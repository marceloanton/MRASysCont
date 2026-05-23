"use client";

import { useActionState } from "react";
import { createTreasuryAccountAction, type TreasuryFormState } from "./actions";

const initialState: TreasuryFormState = {
  message: "",
  ok: false
};

export function TreasuryAccountForm() {
  const [state, formAction, pending] = useActionState(
    createTreasuryAccountAction,
    initialState
  );

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="type">Tipo</label>
      <select id="type" name="type" required defaultValue="CAJA">
        <option value="CAJA">Caja</option>
        <option value="BANCO">Banco</option>
        <option value="BILLETERA">Billetera</option>
      </select>

      <label htmlFor="name">Nombre</label>
      <input id="name" name="name" required />

      <label htmlFor="currency">Moneda</label>
      <select id="currency" name="currency" required defaultValue="ARS">
        <option>ARS</option>
        <option>USD</option>
      </select>

      <label htmlFor="bankName">Banco</label>
      <input id="bankName" name="bankName" />

      <label htmlFor="accountNumber">Numero de cuenta</label>
      <input id="accountNumber" name="accountNumber" />

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear caja/banco"}
      </button>
    </form>
  );
}
