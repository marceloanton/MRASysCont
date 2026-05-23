import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listThirdParties } from "@/lib/phase3/repository";
import { listVouchers } from "@/lib/phase3/voucher-repository";
import { VoucherForm } from "./voucher-form";

export default async function VouchersPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canIssue = tenant.membership.permissions.issueInvoices;
  const [thirdPartiesResult, vouchersResult] = await Promise.all([
    listThirdParties(tenant.company.id),
    listVouchers(tenant.company.id)
  ]);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 3</p>
          <h1>Comprobantes</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{vouchersResult.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nuevo comprobante</h2>
          {canIssue ? (
            <VoucherForm thirdParties={thirdPartiesResult.thirdParties} />
          ) : (
            <p className="emptyState">Tu rol no permite registrar comprobantes.</p>
          )}
        </article>

        <article className="panel">
          <h2>Comprobantes de la empresa</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Operacion</th>
                  <th>Comprobante</th>
                  <th>Tercero</th>
                  <th>Moneda</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {vouchersResult.vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>{voucher.issueDate}</td>
                    <td>{voucher.direction}</td>
                    <td>
                      {voucher.type} {voucher.letter ?? ""}
                      <small className="rowNote">
                        {voucher.pointOfSale}-{voucher.number}
                      </small>
                    </td>
                    <td>{voucher.thirdPartyName}</td>
                    <td>{voucher.currency}</td>
                    <td>{voucher.totalAmount.toLocaleString("es-AR")}</td>
                    <td>{voucher.status}</td>
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
