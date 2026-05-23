"use client";

import { useActionState } from "react";
import type { Company } from "@/lib/phase1/types";
import { createUserAction, type UserFormState } from "./actions";

const initialState: UserFormState = {
  message: "",
  ok: false
};

export function UserForm({ companies }: { companies: Company[] }) {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialState
  );

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="name">Nombre</label>
      <input id="name" name="name" required />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="password">Contrasena inicial</label>
      <input id="password" name="password" type="password" required minLength={8} />

      <label htmlFor="companyId">Empresa asignada</label>
      <select id="companyId" name="companyId" required>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.tradeName ?? company.legalName}
          </option>
        ))}
      </select>

      <label htmlFor="role">Rol</label>
      <select id="role" name="role" required defaultValue="ASISTENTE">
        <option value="CONTADOR">Contador</option>
        <option value="ASISTENTE">Asistente</option>
        <option value="CLIENTE">Cliente</option>
      </select>

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
