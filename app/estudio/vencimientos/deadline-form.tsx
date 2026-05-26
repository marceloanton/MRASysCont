"use client";

import { useActionState } from "react";
import type { Company } from "@/lib/phase1/types";
import { createDeadlineAction, type DeadlineFormState } from "./actions";

type ClientOption = {
  id: string;
  legalName: string;
};

const initialState: DeadlineFormState = { ok: false, message: "" };

export function DeadlineForm({
  clients,
  companies
}: {
  clients: ClientOption[];
  companies: Company[];
}) {
  const [state, action, pending] = useActionState(createDeadlineAction, initialState);
  return (
    <form action={action} className="adminForm">
      <label htmlFor="title">Titulo</label>
      <input id="title" name="title" required />
      <label htmlFor="dueDate">Fecha vencimiento</label>
      <input id="dueDate" name="dueDate" type="date" required />
      <label htmlFor="clientOfStudyId">Cliente</label>
      <select id="clientOfStudyId" name="clientOfStudyId" required defaultValue={clients[0]?.id}>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.legalName}
          </option>
        ))}
      </select>
      <label htmlFor="companyId">Empresa (opcional)</label>
      <select id="companyId" name="companyId" defaultValue="">
        <option value="">Sin empresa</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.tradeName ?? company.legalName}
          </option>
        ))}
      </select>
      {state.message ? <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p> : null}
      <button disabled={pending}>{pending ? "Creando..." : "Crear vencimiento"}</button>
    </form>
  );
}
