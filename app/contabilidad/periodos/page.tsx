import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listAccountingPeriods } from "@/lib/phase2/repository";
import { PeriodForm } from "./period-form";

export default async function PeriodsPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canManage = tenant.membership.permissions.manageSettings;
  const result = await listAccountingPeriods(tenant.company.id);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Periodos contables</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{result.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nuevo periodo</h2>
          {canManage ? (
            <PeriodForm />
          ) : (
            <p className="emptyState">Tu rol no permite crear periodos.</p>
          )}
        </article>

        <article className="panel">
          <h2>Periodos de la empresa</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Desde</th>
                  <th>Hasta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {result.periods.map((period) => (
                  <tr key={period.id}>
                    <td>{period.name}</td>
                    <td>{period.startsAt}</td>
                    <td>{period.endsAt}</td>
                    <td>{period.status}</td>
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
