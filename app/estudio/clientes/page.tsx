import Link from "next/link";
import { redirect } from "next/navigation";
import { listUsers } from "@/lib/phase1/repository";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getRequiredActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listClientsOfStudy } from "@/lib/phase2/study-repository";
import { AssignResponsibleForm, CreateClientForm, MonthlyStatusForm } from "./client-forms";

export default async function StudyClientsPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    redirect("/login");
  }

  const tenant = getRequiredActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const studyId = tenant.company.studyId;
  const [clients, usersResult] = await Promise.all([
    listClientsOfStudy(studyId),
    listUsers(studyId)
  ]);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Clientes del estudio</h1>
        </div>
      </header>
      <section className="adminGrid">
        <article className="panel">
          <h2>Nuevo cliente</h2>
          <CreateClientForm />
        </article>
        <article className="panel">
          <h2>Listado</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>CUIT</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Estado mensual</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.legalName}</td>
                    <td>{client.cuit ?? "-"}</td>
                    <td>{client.status}</td>
                    <td>
                      <AssignResponsibleForm
                        clientId={client.id}
                        users={usersResult.users}
                      />
                    </td>
                    <td>
                      <MonthlyStatusForm clientId={client.id} />
                    </td>
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
