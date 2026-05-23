import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { buildThirdPartyStatements } from "@/lib/phase3/current-account";
import { listThirdParties } from "@/lib/phase3/repository";
import { listSettlements } from "@/lib/phase3/settlement-repository";
import { listVouchers } from "@/lib/phase3/voucher-repository";
import { listTreasury } from "@/lib/phase4/repository";
import { SettlementForm } from "./settlement-form";

export default async function CurrentAccountsPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canIssue = tenant.membership.permissions.issueInvoices;
  const [thirdPartiesResult, vouchersResult, settlementsResult, treasuryResult] = await Promise.all([
    listThirdParties(tenant.company.id),
    listVouchers(tenant.company.id),
    listSettlements(tenant.company.id),
    listTreasury(tenant.company.id)
  ]);
  const statements = buildThirdPartyStatements(
    vouchersResult.vouchers,
    settlementsResult.settlements
  );
  const totalReceivable = statements.reduce((sum, item) => sum + item.receivable, 0);
  const totalPayable = statements.reduce((sum, item) => sum + item.payable, 0);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 3</p>
          <h1>Cuentas corrientes</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{vouchersResult.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="reportSummary">
        <article>
          <span>A cobrar</span>
          <strong>{totalReceivable.toLocaleString("es-AR")}</strong>
        </article>
        <article>
          <span>A pagar</span>
          <strong>{totalPayable.toLocaleString("es-AR")}</strong>
        </article>
        <article>
          <span>Neto</span>
          <strong>{(totalReceivable - totalPayable).toLocaleString("es-AR")}</strong>
        </article>
      </section>

      <section className="adminGrid singleColumn">
        <article className="panel">
          <h2>Registrar cobro/pago</h2>
          {canIssue ? (
            <SettlementForm
              thirdParties={thirdPartiesResult.thirdParties}
              treasuryAccounts={treasuryResult.accounts}
            />
          ) : (
            <p className="emptyState">Tu rol no permite registrar cobros/pagos.</p>
          )}
        </article>
      </section>

      <section className="reportStack">
        {statements.length === 0 ? (
          <article className="panel">
            <p className="emptyState">No hay comprobantes registrados para cuentas corrientes.</p>
          </article>
        ) : (
          statements.map((statement) => (
            <article className="panel" key={statement.thirdPartyId}>
              <header className="statementHeader">
                <h2>{statement.thirdPartyName}</h2>
                <span>
                  Saldo neto {statement.netBalance.toLocaleString("es-AR")}
                </span>
              </header>
              <div className="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Operacion</th>
                      <th>Documento / Referencia</th>
                      <th>Moneda</th>
                      <th>Debe</th>
                      <th>Haber</th>
                      <th>Impacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statement.lines.map((line) => (
                      <tr key={line.id}>
                        <td>{line.issueDate}</td>
                        <td>{line.direction}</td>
                        <td>
                          {line.type}
                          <small className="rowNote">{line.number}</small>
                          {line.treasuryAccountName ? (
                            <small className="rowNote">
                              Tesoreria: {line.treasuryAccountName}
                            </small>
                          ) : null}
                        </td>
                        <td>{line.currency}</td>
                        <td>{line.debit.toLocaleString("es-AR")}</td>
                        <td>{line.credit.toLocaleString("es-AR")}</td>
                        <td>{line.balanceImpact.toLocaleString("es-AR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
