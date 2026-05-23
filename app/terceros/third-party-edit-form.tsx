"use client";

import { useActionState } from "react";
import type { ThirdPartySummary } from "@/lib/phase3/types";
import { updateThirdPartyAction, type ThirdPartyFormState } from "./actions";

const initialState: ThirdPartyFormState = {
  message: "",
  ok: false
};

export function ThirdPartyEditForm({ thirdParty }: { thirdParty: ThirdPartySummary }) {
  const [state, formAction, pending] = useActionState(
    updateThirdPartyAction,
    initialState
  );

  return (
    <details className="draftEdit">
      <summary>Editar tercero</summary>
      <form action={formAction} className="draftEditForm">
        <input type="hidden" name="thirdPartyId" value={thirdParty.id} />

        <label htmlFor={`type-${thirdParty.id}`}>Tipo</label>
        <select id={`type-${thirdParty.id}`} name="type" defaultValue={thirdParty.type} required>
          <option value="CLIENTE">Cliente</option>
          <option value="PROVEEDOR">Proveedor</option>
          <option value="CLIENTE_PROVEEDOR">Cliente y proveedor</option>
        </select>

        <label htmlFor={`legalName-${thirdParty.id}`}>Razon social / Nombre</label>
        <input
          id={`legalName-${thirdParty.id}`}
          name="legalName"
          defaultValue={thirdParty.legalName}
          required
        />

        <label htmlFor={`tradeName-${thirdParty.id}`}>Nombre comercial</label>
        <input
          id={`tradeName-${thirdParty.id}`}
          name="tradeName"
          defaultValue={thirdParty.tradeName ?? ""}
        />

        <label htmlFor={`documentType-${thirdParty.id}`}>Tipo documento</label>
        <select
          id={`documentType-${thirdParty.id}`}
          name="documentType"
          defaultValue={thirdParty.documentType}
          required
        >
          <option>CUIT</option>
          <option>CUIL</option>
          <option>DNI</option>
        </select>

        <label htmlFor={`document-${thirdParty.id}`}>Documento</label>
        <input
          id={`document-${thirdParty.id}`}
          name="document"
          defaultValue={thirdParty.document}
          required
        />

        <label htmlFor={`taxCondition-${thirdParty.id}`}>Condicion fiscal</label>
        <select
          id={`taxCondition-${thirdParty.id}`}
          name="taxCondition"
          defaultValue={thirdParty.taxCondition}
          required
        >
          <option>Responsable Inscripto</option>
          <option>Monotributo</option>
          <option>Exento</option>
          <option>Consumidor Final</option>
        </select>

        <label htmlFor={`email-${thirdParty.id}`}>Email</label>
        <input
          id={`email-${thirdParty.id}`}
          name="email"
          type="email"
          defaultValue={thirdParty.email ?? ""}
        />

        <label htmlFor={`phone-${thirdParty.id}`}>Telefono</label>
        <input id={`phone-${thirdParty.id}`} name="phone" defaultValue={thirdParty.phone ?? ""} />

        <label htmlFor={`address-${thirdParty.id}`}>Direccion</label>
        <input
          id={`address-${thirdParty.id}`}
          name="address"
          defaultValue={thirdParty.address ?? ""}
        />

        {state.message ? (
          <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p>
        ) : null}

        <button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar tercero"}
        </button>
      </form>
    </details>
  );
}
