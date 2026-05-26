import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listAccountingPeriods } from "@/lib/phase4-accounting/repository";
import { getAccountingReports } from "@/lib/phase4-accounting/reports";
import { getVatReports } from "@/lib/phase8/reports";

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
  const periodsResult = await listAccountingPeriods(
    tenant.company.studyId,
    tenant.company.id
  );
  const selectedPeriodId =
    params.periodId && params.periodId !== "todos" ? params.periodId : undefined;
  const exportPeriodQuery = selectedPeriodId
    ? `&periodId=${encodeURIComponent(selectedPeriodId)}`
    : "";
  const reports = await getAccountingReports({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    periodId: selectedPeriodId
  });
  const vatReports = selectedPeriodId
    ? await getVatReports({
        studyId: tenant.company.studyId,
        companyId: tenant.company.id,
        periodId: selectedPeriodId
      })
    : null;
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
        {selectedPeriodId ? (
          <>
            <Link href={`/contabilidad/reportes/export?type=iva-ventas&periodId=${selectedPeriodId}`}>
              IVA Ventas
            </Link>
            <Link href={`/contabilidad/reportes/export?type=iva-compras&periodId=${selectedPeriodId}`}>
              IVA Compras
            </Link>
            <Link href={`/contabilidad/reportes/export?type=iva-mensual&periodId=${selectedPeriodId}`}>
              IVA Mensual
            </Link>
            <Link href={`/contabilidad/reportes/export?type=iva-conciliacion&periodId=${selectedPeriodId}`}>
              IVA Conciliacion
            </Link>
            <Link href={`/contabilidad/reportes/export?type=iva-mensual&periodId=${selectedPeriodId}&format=xlsx`}>
              IVA Excel
            </Link>
          </>
        ) : null}
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

        <article className="panel">
          <h2>IVA base</h2>
          {vatReports ? (
            <>
              <div className="reportSummary">
                <article>
                  <span>Debito fiscal</span>
                  <strong>{vatReports.monthly.salesVatDebitFiscal.toLocaleString("es-AR")}</strong>
                </article>
                <article>
                  <span>Credito fiscal</span>
                  <strong>{vatReports.monthly.purchasesVatCreditFiscal.toLocaleString("es-AR")}</strong>
                </article>
                <article>
                  <span>Neto IVA</span>
                  <strong>{vatReports.monthly.netVatPayable.toLocaleString("es-AR")}</strong>
                </article>
              </div>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Libro</th>
                      <th>Base imponible</th>
                      <th>IVA</th>
                      <th>Exento</th>
                      <th>No gravado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>IVA Ventas</td>
                      <td>{vatReports.monthly.salesTaxableBase.toLocaleString("es-AR")}</td>
                      <td>{vatReports.monthly.salesVatDebitFiscal.toLocaleString("es-AR")}</td>
                      <td>{vatReports.monthly.salesExemptAmount.toLocaleString("es-AR")}</td>
                      <td>{vatReports.monthly.salesNonTaxedAmount.toLocaleString("es-AR")}</td>
                    </tr>
                    <tr>
                      <td>IVA Compras</td>
                      <td>{vatReports.monthly.purchasesTaxableBase.toLocaleString("es-AR")}</td>
                      <td>{vatReports.monthly.purchasesVatCreditFiscal.toLocaleString("es-AR")}</td>
                      <td>{vatReports.monthly.purchasesExemptAmount.toLocaleString("es-AR")}</td>
                      <td>{vatReports.monthly.purchasesNonTaxedAmount.toLocaleString("es-AR")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Conciliacion IVA</th>
                      <th>Esperado</th>
                      <th>Contable</th>
                      <th>Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Debito fiscal</td>
                      <td>{vatReports.reconciliation.expectedVatDebitFiscal.toLocaleString("es-AR")}</td>
                      <td>{vatReports.reconciliation.accountingVatDebitFiscal.toLocaleString("es-AR")}</td>
                      <td>{vatReports.reconciliation.debitDifference.toLocaleString("es-AR")}</td>
                    </tr>
                    <tr>
                      <td>Credito fiscal</td>
                      <td>{vatReports.reconciliation.expectedVatCreditFiscal.toLocaleString("es-AR")}</td>
                      <td>{vatReports.reconciliation.accountingVatCreditFiscal.toLocaleString("es-AR")}</td>
                      <td>{vatReports.reconciliation.creditDifference.toLocaleString("es-AR")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p>Selecciona un periodo para generar libros y reporte mensual de IVA base.</p>
          )}
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
