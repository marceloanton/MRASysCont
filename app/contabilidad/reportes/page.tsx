import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listAccountingPeriods } from "@/lib/phase2/repository";
import { getJournalReport, getLedgerReport } from "@/lib/phase2/reports";

export default async function AccountingReportsPage({
  searchParams
}: {
  searchParams: Promise<{ periodId?: string }>;
}) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const params = await searchParams;
  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const periodsResult = await listAccountingPeriods(tenant.company.id);
  const selectedPeriodId =
    params.periodId && params.periodId !== "todos" ? params.periodId : undefined;
  const [journalReport, ledgerReport] = await Promise.all([
    getJournalReport({
      companyId: tenant.company.id,
      periodId: selectedPeriodId
    }),
    getLedgerReport({
      companyId: tenant.company.id,
      periodId: selectedPeriodId
    })
  ]);
  const totalDebit = journalReport.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = journalReport.lines.reduce((sum, line) => sum + line.credit, 0);

  return (
    <main className="reportPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Reportes contables</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{journalReport.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <form className="filterBar">
        <label htmlFor="periodId">Periodo</label>
        <select id="periodId" name="periodId" defaultValue={selectedPeriodId ?? "todos"}>
          <option value="todos">Todos</option>
          {periodsResult.periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
        <button type="submit">Aplicar</button>
      </form>

      <section className="reportSummary">
        <article>
          <span>Debe</span>
          <strong>{totalDebit.toLocaleString("es-AR")}</strong>
        </article>
        <article>
          <span>Haber</span>
          <strong>{totalCredit.toLocaleString("es-AR")}</strong>
        </article>
        <article>
          <span>Diferencia</span>
          <strong>{(totalDebit - totalCredit).toLocaleString("es-AR")}</strong>
        </article>
      </section>

      <section className="reportStack">
        <article className="panel">
          <h2>Libro Diario</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Asiento</th>
                  <th>Fecha</th>
                  <th>Descripcion</th>
                  <th>Cuenta</th>
                  <th>Debe</th>
                  <th>Haber</th>
                </tr>
              </thead>
              <tbody>
                {journalReport.lines.map((line, index) => (
                  <tr key={`${line.entryId}-${line.accountCode}-${index}`}>
                    <td>{line.number}</td>
                    <td>{line.date}</td>
                    <td>{line.description}</td>
                    <td>
                      {line.accountCode} - {line.accountName}
                    </td>
                    <td>{line.debit.toLocaleString("es-AR")}</td>
                    <td>{line.credit.toLocaleString("es-AR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2>Libro Mayor</h2>
          <div className="ledgerStack">
            {ledgerReport.accounts.map((account) => (
              <section className="ledgerAccount" key={account.accountId}>
                <header>
                  <h3>
                    {account.accountCode} - {account.accountName}
                  </h3>
                  <span>Saldo {account.balance.toLocaleString("es-AR")}</span>
                </header>
                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Asiento</th>
                        <th>Descripcion</th>
                        <th>Debe</th>
                        <th>Haber</th>
                      </tr>
                    </thead>
                    <tbody>
                      {account.lines.map((line, index) => (
                        <tr key={`${line.entryId}-${index}`}>
                          <td>{line.date}</td>
                          <td>{line.number}</td>
                          <td>{line.description}</td>
                          <td>{line.debit.toLocaleString("es-AR")}</td>
                          <td>{line.credit.toLocaleString("es-AR")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
