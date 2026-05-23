"use client";

import { useActionState } from "react";
import { loginWithPassword } from "./actions";

const initialState = {
  error: ""
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginWithPassword, initialState);

  return (
    <form action={formAction} className="loginForm">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="contador@mrasyscont.local"
        required
      />

      <label htmlFor="password">Contrasena</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="MraSysCont2026!"
        required
      />

      {state.error ? <p className="formError">{state.error}</p> : null}

      <button type="submit" disabled={pending}>
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
