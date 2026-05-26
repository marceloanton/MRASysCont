import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  listAccountingPeriods,
  listAccounts,
  listJournalEntries
} from "@/lib/phase4-accounting/repository";
import {
  confirmJournalEntryAction,
  deleteDraftJournalEntryAction,
  reverseJournalEntryAction
} from "./actions";
import { JournalEntryEditForm } from "./journal-entry-edit-form";
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
    listAccounts(tenant.company.studyId, tenant.company.id),
    listAccountingPeriods(tenant.company.studyId, tenant.company.id),
    listJournalEntries(tenant.company.studyId, tenant.company.id)
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
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {entriesResult.entries.map((entry) => (
                  <tr key={entry.id} id={`entry-${entry.id}`}>
                    <td>{entry.number}</td>
                    <td>{entry.date}</td>
                    <td>
                      <strong>{entry.description}</strong>
                      <div className="entryLineDetail">
                        {entry.lines.map((line, index) => (
                          <div key={`${entry.id}-${line.accountId}-${index}`}>
                            <span>
                              {line.accountCode} - {line.accountName}
                            </span>
                            <span>Debe {line.debit.toLocaleString("es-AR")}</span>
                            <span>Haber {line.credit.toLocaleString("es-AR")}</span>
                          </div>
                        ))}
                      </div>
                      {entry.status === "BORRADOR" && canPost ? (
                        <JournalEntryEditForm
                          accounts={accountsResult.accounts}
                          entry={entry}
                        />
                      ) : null}
                    </td>
                    <td>{entry.totalDebit.toLocaleString("es-AR")}</td>
                    <td>{entry.totalCredit.toLocaleString("es-AR")}</td>
                    <td>
                      {entry.status}
                      {entry.reversalOfEntryId ? (
                        <small className="rowNote">Contraasiento</small>
                      ) : null}
                      {entry.reversedByEntryId ? (
                        <small className="rowNote">Anulado por #{entry.reversedByEntryId.slice(0, 6)}</small>
                      ) : null}
                    </td>
                    <td>
                      {entry.status === "BORRADOR" && canPost ? (
                        <div className="actionStack">
                          <form action={confirmJournalEntryAction}>
                            <input type="hidden" name="entryId" value={entry.id} />
                            <button className="tableButton" type="submit">
                              Confirmar
                            </button>
                          </form>
                          <form action={deleteDraftJournalEntryAction}>
                            <input type="hidden" name="entryId" value={entry.id} />
                            <button className="tableButton dangerButton" type="submit">
                              Descartar
                            </button>
                          </form>
                        </div>
                      ) : entry.status === "CONFIRMADO" &&
                        !entry.reversalOfEntryId &&
                        !entry.reversedByEntryId &&
                        canPost ? (
                        <form action={reverseJournalEntryAction} className="inlineAction">
                          <input type="hidden" name="entryId" value={entry.id} />
                          <input
                            name="reason"
                            placeholder="Motivo"
                            required
                            aria-label="Motivo de anulacion"
                          />
                          <button className="tableButton dangerButton" type="submit">
                            Anular
                          </button>
                        </form>
                      ) : (
                        <span className="mutedText">Bloqueado</span>
                      )}
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
