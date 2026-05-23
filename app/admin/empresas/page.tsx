import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { CompanyForm } from "./company-form";

export default async function CompaniesPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const activeTenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canManage = activeTenant.membership.permissions.manageSettings;

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 1</p>
          <h1>Empresas</h1>
          <p>Alta y control de tenants contables.</p>
        </div>
        <span>{workspace.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nueva empresa</h2>
          {canManage ? (
            <CompanyForm />
          ) : (
            <p className="emptyState">Tu rol no permite crear empresas.</p>
          )}
        </article>

        <article className="panel">
          <h2>Empresas registradas</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>CUIT</th>
                  <th>Condicion</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {workspace.companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.legalName}</td>
                    <td>{company.cuit}</td>
                    <td>{company.taxCondition}</td>
                    <td>{company.status}</td>
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
