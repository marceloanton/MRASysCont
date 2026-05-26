import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getRequiredActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { getStudyDashboardSummary } from "@/lib/phase2/study-repository";

export default async function StudyDashboardPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    redirect("/login");
  }

  const tenant = getRequiredActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const summary = await getStudyDashboardSummary(tenant.company.studyId);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Dashboard del estudio</h1>
        </div>
      </header>
      <section className="adminGrid">
        <article className="panel">
          <h2>Clientes activos</h2>
          <p>{summary.clients}</p>
        </article>
        <article className="panel">
          <h2>Tareas abiertas</h2>
          <p>{summary.tasksOpen}</p>
        </article>
        <article className="panel">
          <h2>Vencimientos pendientes</h2>
          <p>{summary.deadlinesUpcoming}</p>
        </article>
      </section>
    </main>
  );
}
