"use client";

import { useActionState } from "react";
import { createStudyAction, type StudyFormState } from "./actions";

const initialState: StudyFormState = {
  ok: false,
  message: ""
};

export function StudyForm() {
  const [state, formAction, pending] = useActionState(
    createStudyAction,
    initialState
  );

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="name">Nombre del estudio</label>
      <input id="name" name="name" required />

      <label htmlFor="slug">Slug (unico)</label>
      <input id="slug" name="slug" required />

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear estudio"}
      </button>
    </form>
  );
}
