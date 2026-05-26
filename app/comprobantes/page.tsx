import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listThirdParties } from "@/lib/phase3/repository";
import { listVouchers } from "@/lib/phase3/voucher-repository";
import { confirmJournalEntryAction } from "@/app/contabilidad/asientos/actions";
import { cancelVoucherAction, confirmVoucherAction } from "./actions";
import { ConfirmSubmitButton } from "./confirm-submit-button";
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
  const canPost = tenant.membership.permissions.postAccounting;
  const [thirdPartiesResult, vouchersResult] = await Promise.all([
    listThirdParties(tenant.company.studyId, tenant.company.id),
    listVouchers(tenant.company.studyId, tenant.company.id)
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
            <VoucherForm
              thirdParties={thirdPartiesResult.thirdParties}
              vouchers={vouchersResult.vouchers}
            />
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
                  <th>Asiento</th>
                  <th>Accion</th>
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
                        {voucher.pointOfSale}-{voucher.number ?? "PENDIENTE"}
                      </small>
                    </td>
                    <td>{voucher.thirdPartyName}</td>
                    <td>
                      {voucher.journalEntryId ? (
                        <div className="actionStack">
                          <Link href={`/contabilidad/asientos#entry-${voucher.journalEntryId}`}>
                            Ver asiento
                          </Link>
                          <Link href={`/comprobantes/${voucher.id}/pdf`} target="_blank">
                            PDF local
                          </Link>
                          {voucher.status === "BORRADOR" && canPost ? (
                            <div className="actionStack">
                              <form action={confirmJournalEntryAction}>
                                <input type="hidden" name="entryId" value={voucher.journalEntryId} />
                                <button className="tableButton" type="submit">
                                  Confirmar asiento
                                </button>
                              </form>
                              <form
                                action={async (formData) => {
                                  "use server";
                                  await confirmVoucherAction(formData);
                                }}
                              >
                                <input type="hidden" name="voucherId" value={voucher.id} />
                                <button className="tableButton" type="submit">
                                  Confirmar comprobante
                                </button>
                              </form>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="actionStack">
                          <span>Pendiente</span>
                          <Link href={`/comprobantes/${voucher.id}/pdf`} target="_blank">
                            PDF local
                          </Link>
                        </div>
                      )}
                    </td>
                    <td>
                      {voucher.status === "BORRADOR" ? (
                        <div className="actionStack">
                          <span className="rowNote">Pendiente contable</span>
                          {canIssue ? (
                            <form
                              action={async (formData) => {
                                "use server";
                                await cancelVoucherAction(formData);
                              }}
                            >
                              <input type="hidden" name="voucherId" value={voucher.id} />
                              <ConfirmSubmitButton
                                className="tableButton"
                                label="Anular comprobante"
                                confirmMessage="Esta accion anula el comprobante borrador. ¿Querés continuar?"
                              />
                            </form>
                          ) : null}
                        </div>
                      ) : (
                        "Contabilizado"
                      )}
                    </td>
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
