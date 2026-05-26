import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { getAccountingReports } from "@/lib/phase4-accounting/reports";
import { PrintButton } from "./print-button";

export default async function PrintableReportsPage({
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
  const selectedPeriodId =
    params.periodId && params.periodId !== "todos" ? params.periodId : undefined;
  const reports = await getAccountingReports({
    studyId: tenant.company.studyId,
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
    <main className="printPage">
      <nav className="printActions" aria-label="Acciones de impresion">
        <Link href={`/contabilidad/reportes${selectedPeriodId ? `?periodId=${selectedPeriodId}` : ""}`}>
          Volver a reportes
        </Link>
        <PrintButton />
      </nav>

      <header className="printHeader">
        <p>MRASysCont</p>
        <h1>Reportes contables</h1>
        <dl>
          <div>
            <dt>Empresa</dt>
            <dd>{tenant.company.legalName}</dd>
          </div>
          <div>
            <dt>CUIT</dt>
            <dd>{tenant.company.cuit}</dd>
          </div>
          <div>
            <dt>Periodo</dt>
            <dd>{selectedPeriodId ?? "Todos"}</dd>
          </div>
          <div>
            <dt>Fuente</dt>
            <dd>{reports.source === "database" ? "PostgreSQL" : "Demo local"}</dd>
          </div>
        </dl>
      </header>

      <section className="printSection">
        <h2>Balance de sumas y saldos</h2>
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
      </section>

      <section className="printSection">
        <h2>Libro Diario</h2>
        <table>
          <thead>
            <tr>
              <th>Asiento</th>
              <th>Fecha</th>
              <th>Descripcion</th>
              <th>Cuenta</th>
              <th>Mon. orig.</th>
              <th>Imp. orig.</th>
              <th>T/C</th>
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
                <td>{line.currency ?? "ARS"}</td>
                <td>{line.originalAmount?.toLocaleString("es-AR") ?? "-"}</td>
                <td>{line.exchangeRate?.toLocaleString("es-AR") ?? "-"}</td>
                <td>{line.debit.toLocaleString("es-AR")}</td>
                <td>{line.credit.toLocaleString("es-AR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="printSection">
        <h2>Libro Mayor</h2>
        {reports.ledgerAccounts.map((account) => (
          <article className="printLedgerAccount" key={account.accountId}>
            <h3>
              {account.accountCode} - {account.accountName} | Saldo{" "}
              {account.balance.toLocaleString("es-AR")}
            </h3>
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
          </article>
        ))}
      </section>
    </main>
  );
}
