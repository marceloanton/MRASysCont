import Link from "next/link";
import { redirect } from "next/navigation";
import { listMemberships, listUsers } from "@/lib/phase1/repository";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { UserForm } from "./user-form";

export default async function UsersPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const activeTenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canManage = activeTenant.membership.permissions.manageUsers;
  const usersResult = await listUsers();
  const membershipsResult = await listMemberships();

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 1</p>
          <h1>Usuarios</h1>
          <p>Alta de operadores y asignacion inicial a empresas.</p>
        </div>
        <span>{usersResult.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nuevo usuario</h2>
          {canManage ? (
            <UserForm companies={workspace.companies} />
          ) : (
            <p className="emptyState">Tu rol no permite crear usuarios.</p>
          )}
        </article>

        <article className="panel">
          <h2>Usuarios registrados</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Roles asignados</th>
                </tr>
              </thead>
              <tbody>
                {usersResult.users.map((user) => {
                  const roles = membershipsResult.memberships
                    .filter((membership) => membership.userId === user.id)
                    .map((membership) => membership.role)
                    .join(", ");

                  return (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{roles || "Sin asignacion"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  );
}
