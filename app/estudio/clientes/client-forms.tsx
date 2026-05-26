"use client";

import { useActionState } from "react";
import type { User } from "@/lib/phase1/types";
import {
  assignResponsibleAction,
  createClientAction,
  type ClientFormState,
  updateMonthlyStatusAction
} from "./actions";

const initialState: ClientFormState = { ok: false, message: "" };

export function CreateClientForm() {
  const [state, action, pending] = useActionState(createClientAction, initialState);
  return (
    <form action={action} className="adminForm">
      <label htmlFor="legalName">Razon social</label>
      <input id="legalName" name="legalName" required />
      <label htmlFor="cuit">CUIT</label>
      <input id="cuit" name="cuit" />
      {state.message ? <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p> : null}
      <button disabled={pending}>{pending ? "Creando..." : "Crear cliente"}</button>
    </form>
  );
}

export function AssignResponsibleForm({
  clientId,
  users
}: {
  clientId: string;
  users: User[];
}) {
  const [state, action, pending] = useActionState(assignResponsibleAction, initialState);
  return (
    <form action={action} className="inlineForm">
      <input type="hidden" name="clientOfStudyId" value={clientId} />
      <select name="userId" defaultValue={users[0]?.id}>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <button disabled={pending}>{pending ? "..." : "Asignar"}</button>
      {state.message ? <small>{state.message}</small> : null}
    </form>
  );
}

export function MonthlyStatusForm({ clientId }: { clientId: string }) {
  const [state, action, pending] = useActionState(updateMonthlyStatusAction, initialState);
  return (
    <form action={action} className="inlineForm">
      <input type="hidden" name="clientOfStudyId" value={clientId} />
      <input name="period" placeholder="2026-05" required />
      <select name="nextStatus" defaultValue="IN_PROGRESS">
        <option value="IN_PROGRESS">in_progress</option>
        <option value="WAITING_DOCUMENTATION">waiting_documentation</option>
        <option value="IN_REVIEW">in_review</option>
        <option value="READY">ready</option>
        <option value="CLOSED">closed</option>
        <option value="OBSERVED">observed</option>
      </select>
      <button disabled={pending}>{pending ? "..." : "Actualizar"}</button>
      {state.message ? <small>{state.message}</small> : null}
    </form>
  );
}
