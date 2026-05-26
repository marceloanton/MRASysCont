import Link from "next/link";
import { redirect } from "next/navigation";
import { listUsers } from "@/lib/phase1/repository";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getRequiredActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listStudyTasks } from "@/lib/phase2/study-repository";
import { TaskForm } from "./task-form";

export default async function StudyTasksPage() {
  const workspace = await getWorkspaceContext();
  if (!workspace) {
    redirect("/login");
  }

  const tenant = getRequiredActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const [usersResult, tasks] = await Promise.all([
    listUsers(tenant.company.studyId),
    listStudyTasks({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: workspace.session.user.id
    })
  ]);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Tareas internas</h1>
        </div>
      </header>
      <section className="adminGrid">
        <article className="panel">
          <h2>Nueva tarea</h2>
          <TaskForm users={usersResult.users} companies={workspace.companies} />
        </article>
        <article className="panel">
          <h2>Tareas</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Estado</th>
                  <th>Asignado</th>
                  <th>Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.status}</td>
                    <td>{task.assignedUserId ?? "-"}</td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString("es-AR") : "-"}</td>
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
