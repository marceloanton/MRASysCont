"use client";

import { useActionState } from "react";
import type { Company } from "@/lib/phase1/types";
import { createStudyDocumentAction, downloadStudyDocumentAction, type StudyDocumentFormState, updateStudyDocumentStatusAction } from "./actions";

const initialState: StudyDocumentFormState = { ok: false, message: "" };

export function CreateDocumentForm({
  companies
}: {
  companies: Company[];
}) {
  const [state, action, pending] = useActionState(createStudyDocumentAction, initialState);

  return (
    <form action={action} className="adminForm">
      <label htmlFor="title">Titulo</label>
      <input id="title" name="title" required />
      <label htmlFor="category">Categoria</label>
      <input id="category" name="category" required />
      <label htmlFor="companyId">Empresa (opcional)</label>
      <select id="companyId" name="companyId" defaultValue="">
        <option value="">Sin empresa</option>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.tradeName ?? company.legalName}
          </option>
        ))}
      </select>
      <label htmlFor="clientOfStudyId">Cliente del estudio (opcional)</label>
      <input id="clientOfStudyId" name="clientOfStudyId" placeholder="cli_xxx" />
      <label htmlFor="period">Periodo (opcional)</label>
      <input id="period" name="period" placeholder="2026-05" />
      <label htmlFor="visibility">Visibilidad</label>
      <select id="visibility" name="visibility" defaultValue="INTERNAL">
        <option value="INTERNAL">INTERNAL</option>
        <option value="CLIENT_VISIBLE">CLIENT_VISIBLE</option>
      </select>
      <label htmlFor="mimeType">MIME type</label>
      <input id="mimeType" name="mimeType" placeholder="application/pdf" required />
      <label htmlFor="sizeBytes">Tamano (bytes)</label>
      <input id="sizeBytes" name="sizeBytes" type="number" min={1} required />
      <label htmlFor="checksumSha256">Checksum SHA-256</label>
      <input id="checksumSha256" name="checksumSha256" required />
      <label htmlFor="storageKey">Storage key</label>
      <input id="storageKey" name="storageKey" required />
      <label htmlFor="notes">Notas</label>
      <textarea id="notes" name="notes" rows={2} />
      {state.message ? <p className={state.ok ? "formSuccess" : "formError"}>{state.message}</p> : null}
      <button disabled={pending}>{pending ? "Registrando..." : "Registrar documento"}</button>
    </form>
  );
}

export function ReviewDocumentForm({
  documentId,
  readOnlyForClient = false
}: {
  documentId: string;
  readOnlyForClient?: boolean;
}) {
  const [state, action, pending] = useActionState(updateStudyDocumentStatusAction, initialState);
  if (readOnlyForClient) {
    return <span className="mutedText">Sin permiso</span>;
  }
  return (
    <form action={action} className="inlineForm">
      <input type="hidden" name="documentId" value={documentId} />
      <select name="nextStatus" defaultValue="PENDING_REVIEW">
        <option value="PENDING_REVIEW">PENDING_REVIEW</option>
        <option value="OBSERVED">OBSERVED</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
        <option value="ARCHIVED">ARCHIVED</option>
      </select>
      <input name="notes" placeholder="Motivo/nota" />
      <button disabled={pending}>{pending ? "..." : "Actualizar"}</button>
      {state.message ? <span className={state.ok ? "formSuccess" : "formError"}>{state.message}</span> : null}
    </form>
  );
}

export function DownloadDocumentForm({
  documentId
}: {
  documentId: string;
}) {
  const [state, action, pending] = useActionState(downloadStudyDocumentAction, initialState);
  return (
    <form action={action} className="inlineForm">
      <input type="hidden" name="documentId" value={documentId} />
      <button disabled={pending}>{pending ? "..." : "Descargar (audit)"}</button>
      {state.message ? <span className={state.ok ? "formSuccess" : "formError"}>{state.message}</span> : null}
    </form>
  );
}
