import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listTreasury } from "@/lib/phase4/repository";
import { TreasuryAccountForm } from "./treasury-account-form";
import { TreasuryMovementForm } from "./treasury-movement-form";

export default async function TreasuryPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canManage = tenant.membership.permissions.manageSettings;
  const canMove = tenant.membership.permissions.issueInvoices;
  const result = await listTreasury(tenant.company.id);
  const totalBalance = result.accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 4</p>
          <h1>Tesoreria</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{result.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="reportSummary">
        <article>
          <span>Cuentas</span>
          <strong>{result.accounts.length}</strong>
        </article>
        <article>
          <span>Movimientos</span>
          <strong>{result.movements.length}</strong>
        </article>
        <article>
          <span>Saldo total</span>
          <strong>{totalBalance.toLocaleString("es-AR")}</strong>
        </article>
      </section>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nueva caja/banco</h2>
          {canManage ? (
            <TreasuryAccountForm />
          ) : (
            <p className="emptyState">Tu rol no permite crear cuentas.</p>
          )}
        </article>

        <article className="panel">
          <h2>Nuevo movimiento</h2>
          {canMove ? (
            <TreasuryMovementForm accounts={result.accounts} />
          ) : (
            <p className="emptyState">Tu rol no permite registrar movimientos.</p>
          )}
        </article>
      </section>

      <section className="reportStack">
        <article className="panel">
          <h2>Saldos por cuenta</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th>Moneda</th>
                  <th>Banco</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {result.accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.name}</td>
                    <td>{account.type}</td>
                    <td>{account.currency}</td>
                    <td>{account.bankName ?? "-"}</td>
                    <td>{account.balance.toLocaleString("es-AR")}</td>
                    <td>{account.active ? "ACTIVA" : "INACTIVA"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h2>Movimientos recientes</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th>Descripcion</th>
                  <th>Importe</th>
                  <th>Impacto</th>
                </tr>
              </thead>
              <tbody>
                {result.movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.date}</td>
                    <td>{movement.treasuryAccountName}</td>
                    <td>{movement.type}</td>
                    <td>
                      {movement.description}
                      {movement.reference ? (
                        <small className="rowNote">{movement.reference}</small>
                      ) : null}
                    </td>
                    <td>{movement.amount.toLocaleString("es-AR")}</td>
                    <td>{movement.signedAmount.toLocaleString("es-AR")}</td>
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
