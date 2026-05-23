import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listThirdParties } from "@/lib/phase3/repository";
import { ThirdPartyForm } from "./third-party-form";

export default async function ThirdPartiesPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canManage = tenant.membership.permissions.manageSettings;
  const result = await listThirdParties(tenant.company.id);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 3</p>
          <h1>Terceros</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{result.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nuevo cliente/proveedor</h2>
          {canManage ? (
            <ThirdPartyForm />
          ) : (
            <p className="emptyState">Tu rol no permite crear terceros.</p>
          )}
        </article>

        <article className="panel">
          <h2>Terceros de la empresa</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Documento</th>
                  <th>Condicion</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {result.thirdParties.map((thirdParty) => (
                  <tr key={thirdParty.id}>
                    <td>
                      <strong>{thirdParty.legalName}</strong>
                      {thirdParty.tradeName ? (
                        <small className="rowNote">{thirdParty.tradeName}</small>
                      ) : null}
                    </td>
                    <td>{thirdParty.type}</td>
                    <td>
                      {thirdParty.documentType} {thirdParty.document}
                    </td>
                    <td>{thirdParty.taxCondition}</td>
                    <td>
                      {thirdParty.email ? <span>{thirdParty.email}</span> : null}
                      {thirdParty.phone ? (
                        <small className="rowNote">{thirdParty.phone}</small>
                      ) : null}
                    </td>
                    <td>{thirdParty.active ? "ACTIVO" : "INACTIVO"}</td>
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
