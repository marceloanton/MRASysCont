import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getRequiredActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listClientsOfStudy, listStudyDeadlines } from "@/lib/phase2/study-repository";
import { DeadlineForm } from "./deadline-form";

export default async function StudyDeadlinesPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    redirect("/login");
  }

  const tenant = getRequiredActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const [clients, deadlines] = await Promise.all([
    listClientsOfStudy(tenant.company.studyId),
    listStudyDeadlines(tenant.company.studyId)
  ]);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Vencimientos</h1>
        </div>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nuevo vencimiento</h2>
          <DeadlineForm
            clients={clients.map((client) => ({ id: client.id, legalName: client.legalName }))}
            companies={workspace.companies}
          />
        </article>
        <article className="panel">
          <h2>Listado</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Estado</th>
                  <th>Vence</th>
                  <th>Cliente</th>
                </tr>
              </thead>
              <tbody>
                {deadlines.map((deadline) => (
                  <tr key={deadline.id}>
                    <td>{deadline.title}</td>
                    <td>{deadline.status}</td>
                    <td>{new Date(deadline.dueDate).toLocaleDateString("es-AR")}</td>
                    <td>{deadline.clientOfStudyId}</td>
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
