"use client";

import { useActionState } from "react";
import type { Company, User } from "@/lib/phase1/types";
import { createTaskAction, type TaskFormState } from "./actions";

const initialState: TaskFormState = { ok: false, message: "" };

export function TaskForm({
  users,
  companies
}: {
  users: User[];
  companies: Company[];
}) {
  const [state, action, pending] = useActionState(createTaskAction, initialState);
  return (
    <form action={action} className="adminForm">
      <label htmlFor="title">Titulo</label>
      <input id="title" name="title" required />
      <label htmlFor="companyId">Empresa (opcional)</label>
      <select id="companyId" name="companyId" defaultValue="">
        <option value="">Sin empresa</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.tradeName ?? company.legalName}
          </option>
        ))}
      </select>
      <label htmlFor="assignedUserId">Asignado a (opcional)</label>
      <select id="assignedUserId" name="assignedUserId" defaultValue="">
        <option value="">Sin asignar</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      {state.message ? <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p> : null}
      <button disabled={pending}>{pending ? "Creando..." : "Crear tarea"}</button>
    </form>
  );
}
