"use client";

import { useActionState } from "react";
import { accountTypes } from "@/lib/phase2/validation";
import { createAccountAction, type AccountFormState } from "./actions";

const initialState: AccountFormState = {
  message: "",
  ok: false
};

export function AccountForm() {
  const [state, formAction, pending] = useActionState(
    createAccountAction,
    initialState
  );

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="code">Codigo</label>
      <input id="code" name="code" placeholder="1.01.001" required />

      <label htmlFor="name">Nombre</label>
      <input id="name" name="name" placeholder="Caja" required />

      <label htmlFor="type">Tipo</label>
      <select id="type" name="type" required defaultValue="ACTIVO">
        {accountTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <label className="checkRow" htmlFor="imputable">
        <input id="imputable" name="imputable" type="checkbox" defaultChecked />
        Cuenta imputable
      </label>

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear cuenta"}
      </button>
    </form>
  );
}
