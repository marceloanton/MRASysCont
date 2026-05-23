import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listAccountingPeriods } from "@/lib/phase2/repository";
import { getAccountingReports } from "@/lib/phase2/reports";

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
  const exportPeriodQuery = selectedPeriodId
    ? `&periodId=${encodeURIComponent(selectedPeriodId)}`
    : "";
  const reports = await getAccountingReports({
    companyId: tenant.company.id,
    periodId: selectedPeriodId
  });
  const totalDebit = reports.journalLines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = reports.journalLines.reduce((sum, line) => sum + line.credit, 0);
  const totalDebitBalance = reports.trialBalanceLines.reduce(
    (sum, line) => sum + line.debitBalance,
    0
  );
  const totalCreditBalance = reports.trialBalanceLines.reduce(
    (sum, line) => sum + line.creditBalance,
    0
  );

  return (
    <main className="reportPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Reportes contables</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{reports.source === "database" ? "PostgreSQL" : "Demo local"}</span>
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

      <section className="exportBar" aria-label="Exportaciones CSV">
        <span>Exportar CSV</span>
        <Link href={`/contabilidad/reportes/export?type=balance${exportPeriodQuery}`}>
          Balance
        </Link>
        <Link href={`/contabilidad/reportes/export?type=diario${exportPeriodQuery}`}>
          Diario
        </Link>
        <Link href={`/contabilidad/reportes/export?type=mayor${exportPeriodQuery}`}>
          Mayor
        </Link>
        <Link href={`/contabilidad/reportes/imprimir?periodId=${selectedPeriodId ?? "todos"}`}>
          Imprimir / PDF
        </Link>
      </section>

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
          <h2>Balance de sumas y saldos</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th>Debe</th>
                  <th>Haber</th>
                  <th>Saldo deudor</th>
                  <th>Saldo acreedor</th>
                </tr>
              </thead>
              <tbody>
                {reports.trialBalanceLines.map((line) => (
                  <tr key={line.accountId}>
                    <td>
                      {line.accountCode} - {line.accountName}
                    </td>
                    <td>{line.accountType}</td>
                    <td>{line.totalDebit.toLocaleString("es-AR")}</td>
                    <td>{line.totalCredit.toLocaleString("es-AR")}</td>
                    <td>{line.debitBalance.toLocaleString("es-AR")}</td>
                    <td>{line.creditBalance.toLocaleString("es-AR")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={2}>Totales</th>
                  <th>{totalDebit.toLocaleString("es-AR")}</th>
                  <th>{totalCredit.toLocaleString("es-AR")}</th>
                  <th>{totalDebitBalance.toLocaleString("es-AR")}</th>
                  <th>{totalCreditBalance.toLocaleString("es-AR")}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>

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
                {reports.journalLines.map((line, index) => (
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
            {reports.ledgerAccounts.map((account) => (
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
