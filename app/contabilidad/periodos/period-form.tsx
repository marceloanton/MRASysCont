"use client";

import { useActionState } from "react";
import { createPeriodAction, type PeriodFormState } from "./actions";

const initialState: PeriodFormState = {
  message: "",
  ok: false
};

export function PeriodForm() {
  const [state, formAction, pending] = useActionState(
    createPeriodAction,
    initialState
  );

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="name">Nombre</label>
      <input id="name" name="name" placeholder="Enero 2026" required />

      <label htmlFor="startsAt">Desde</label>
      <input id="startsAt" name="startsAt" type="date" required />

      <label htmlFor="endsAt">Hasta</label>
      <input id="endsAt" name="endsAt" type="date" required />

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear periodo"}
      </button>
    </form>
  );
}
