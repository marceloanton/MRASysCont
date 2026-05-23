"use client";

import { useActionState } from "react";
import { createCompanyAction, type CompanyFormState } from "./actions";

const initialState: CompanyFormState = {
  message: "",
  ok: false
};

export function CompanyForm() {
  const [state, formAction, pending] = useActionState(
    createCompanyAction,
    initialState
  );

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="legalName">Razon social</label>
      <input id="legalName" name="legalName" required />

      <label htmlFor="tradeName">Nombre comercial</label>
      <input id="tradeName" name="tradeName" />

      <label htmlFor="cuit">CUIT</label>
      <input id="cuit" name="cuit" placeholder="30-00000000-0" required />

      <label htmlFor="taxCondition">Condicion fiscal</label>
      <select id="taxCondition" name="taxCondition" required defaultValue="Responsable Inscripto">
        <option>Responsable Inscripto</option>
        <option>Monotributo</option>
        <option>Exento</option>
        <option>Consumidor Final</option>
      </select>

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear empresa"}
      </button>
    </form>
  );
}
