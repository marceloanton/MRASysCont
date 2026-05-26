import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getRequiredActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  listMissingStudyDocuments,
  listStudyDocuments,
  parseDocumentPeriod
} from "@/lib/phase5-documents/repository";
import type { DocumentStatus } from "@/lib/phase5-documents/guards";
import { CreateDocumentForm, DownloadDocumentForm, ReviewDocumentForm } from "./document-forms";

export default async function StudyDocumentsPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    companyId?: string;
    period?: string;
    category?: string;
    status?: string;
  }>;
}) {
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    redirect("/login");
  }
  const params = await searchParams;

  const tenant = getRequiredActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  const [documents, missing] = await Promise.all([
    listStudyDocuments({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: workspace.session.user.id,
      actorCompanyId: tenant.company.id,
      companyId: params.companyId || undefined,
      period: params.period || undefined,
      category: params.category || undefined,
      status: params.status as DocumentStatus | undefined,
      q: params.q || undefined
    }),
    listMissingStudyDocuments({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: workspace.session.user.id,
      actorCompanyId: tenant.company.id,
      companyId: params.companyId || undefined,
      period: params.period || undefined
    })
  ]);

  const getPeriod = (notes?: string | null) => parseDocumentPeriod(notes) ?? "sin-periodo";

  const folders = Array.from(
    new Set(
      documents.map(
        (document) =>
          `${document.clientOfStudy?.legalName ?? "sin-cliente"} / ${document.company?.legalName ?? "sin-empresa"} / ${getPeriod(document.notes)}`
      )
    )
  );

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 5</p>
          <h1>Expediente documental</h1>
        </div>
      </header>
      <section className="adminGrid">
        <article className="panel">
          <h2>Registrar documento</h2>
          <CreateDocumentForm companies={workspace.companies} />
        </article>
        <article className="panel">
          <h2>Buscador y filtros</h2>
          <form className="inlineForm">
            <input name="q" placeholder="Buscar por titulo/categoria/notas" defaultValue={params.q ?? ""} />
            <select name="companyId" defaultValue={params.companyId ?? ""}>
              <option value="">Todas las empresas</option>
              {workspace.companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.tradeName ?? company.legalName}
                </option>
              ))}
            </select>
            <input name="period" placeholder="Periodo (ej: 2026-05)" defaultValue={params.period ?? ""} />
            <input name="category" placeholder="Categoria" defaultValue={params.category ?? ""} />
            <button type="submit">Aplicar</button>
          </form>
          <h3>Carpetas detectadas</h3>
          <ul>
            {folders.map((folder) => (
              <li key={folder}>{folder}</li>
            ))}
          </ul>
          <h3>Documentacion faltante</h3>
          <ul>
            {missing.map((item) => (
              <li key={`${item.category}-${item.period ?? "all"}-${item.companyId ?? "all"}`}>
                {item.category} ({item.period ?? "sin periodo"})
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h2>Documentos</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Categoria</th>
                  <th>Estado</th>
                  <th>Empresa</th>
                  <th>Periodo</th>
                  <th>Historial</th>
                  <th>Revision</th>
                  <th>Descarga</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td>{document.title}</td>
                    <td>{document.category}</td>
                    <td>{document.status}</td>
                    <td>{document.company?.legalName ?? "-"}</td>
                    <td>{parseDocumentPeriod(document.notes) ?? "-"}</td>
                    <td>
                      <small>
                        Subio: {document.createdByUser?.name ?? "-"}<br />
                        Reviso: {document.reviewedByUser?.name ?? "-"}<br />
                        Descargas: {document.accessLogs.length}
                      </small>
                    </td>
                    <td>
                      <ReviewDocumentForm
                        documentId={document.id}
                        readOnlyForClient={tenant.membership.role === "CLIENTE"}
                      />
                    </td>
                    <td>
                      <DownloadDocumentForm documentId={document.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
