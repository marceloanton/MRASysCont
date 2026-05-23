import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  listAccountingPeriods,
  listAccounts,
  listJournalEntries
} from "@/lib/phase2/repository";
import { JournalEntryForm } from "./journal-entry-form";

export default async function JournalEntriesPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canPost = tenant.membership.permissions.postAccounting;
  const [accountsResult, periodsResult, entriesResult] = await Promise.all([
    listAccounts(tenant.company.id),
    listAccountingPeriods(tenant.company.id),
    listJournalEntries(tenant.company.id)
  ]);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Asientos</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{entriesResult.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nuevo borrador</h2>
          {canPost ? (
            <JournalEntryForm
              accounts={accountsResult.accounts}
              periods={periodsResult.periods}
            />
          ) : (
            <p className="emptyState">Tu rol no permite cargar asientos.</p>
          )}
        </article>

        <article className="panel">
          <h2>Asientos de la empresa</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Nro</th>
                  <th>Fecha</th>
                  <th>Descripcion</th>
                  <th>Debe</th>
                  <th>Haber</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {entriesResult.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.number}</td>
                    <td>{entry.date}</td>
                    <td>{entry.description}</td>
                    <td>{entry.totalDebit.toLocaleString("es-AR")}</td>
                    <td>{entry.totalCredit.toLocaleString("es-AR")}</td>
                    <td>{entry.status}</td>
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
