"use client";

import { useActionState } from "react";
import { createThirdPartyAction, type ThirdPartyFormState } from "./actions";

const initialState: ThirdPartyFormState = {
  message: "",
  ok: false
};

export function ThirdPartyForm() {
  const [state, formAction, pending] = useActionState(
    createThirdPartyAction,
    initialState
  );

  return (
    <form action={formAction} className="adminForm">
      <label htmlFor="type">Tipo</label>
      <select id="type" name="type" required defaultValue="CLIENTE">
        <option value="CLIENTE">Cliente</option>
        <option value="PROVEEDOR">Proveedor</option>
        <option value="CLIENTE_PROVEEDOR">Cliente y proveedor</option>
      </select>

      <label htmlFor="legalName">Razon social / Nombre</label>
      <input id="legalName" name="legalName" required />

      <label htmlFor="tradeName">Nombre comercial</label>
      <input id="tradeName" name="tradeName" />

      <label htmlFor="documentType">Tipo documento</label>
      <select id="documentType" name="documentType" required defaultValue="CUIT">
        <option>CUIT</option>
        <option>CUIL</option>
        <option>DNI</option>
      </select>

      <label htmlFor="document">Documento</label>
      <input id="document" name="document" placeholder="30-00000000-0" required />

      <label htmlFor="taxCondition">Condicion fiscal</label>
      <select id="taxCondition" name="taxCondition" required defaultValue="Responsable Inscripto">
        <option>Responsable Inscripto</option>
        <option>Monotributo</option>
        <option>Exento</option>
        <option>Consumidor Final</option>
      </select>

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" />

      <label htmlFor="phone">Telefono</label>
      <input id="phone" name="phone" />

      <label htmlFor="address">Direccion</label>
      <input id="address" name="address" />

      {state.message ? (
        <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear tercero"}
      </button>
    </form>
  );
}
