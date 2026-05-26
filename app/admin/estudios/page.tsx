import Link from "next/link";
import { redirect } from "next/navigation";
import { listStudiesForUser } from "@/lib/phase1/repository";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { StudyForm } from "./study-form";

export default async function StudiesPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const activeTenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );

  const studiesResult = await listStudiesForUser(workspace.session.user.id);
  const activeStudyId = workspace.session.activeStudyId ?? activeTenant.membership.studyId;
  const canManage = activeTenant.membership.permissions.manageSettings;

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 1</p>
          <h1>Estudios</h1>
          <p>Contexto de tenant principal y membresias activas.</p>
        </div>
        <span>{workspace.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Estudio activo</h2>
          <p>
            ID: <strong>{activeStudyId}</strong>
          </p>
          <p>
            Empresa activa:{" "}
            <strong>{activeTenant.company.tradeName ?? activeTenant.company.legalName}</strong>
          </p>
        </article>

        <article className="panel">
          <h2>Nuevo estudio</h2>
          {canManage ? (
            <StudyForm />
          ) : (
            <p className="emptyState">Tu rol no permite crear estudios.</p>
          )}
        </article>

        <article className="panel">
          <h2>Estudios asignados al usuario</h2>
          {studiesResult.studies.length === 0 ? (
            <p className="emptyState">No hay estudios activos asignados.</p>
          ) : (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Slug</th>
                  </tr>
                </thead>
                <tbody>
                  {studiesResult.studies.map((study) => (
                    <tr key={study.id}>
                      <td>{study.id}</td>
                      <td>{study.name}</td>
                      <td>{study.slug}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
