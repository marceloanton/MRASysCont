import { redirect } from "next/navigation";
import { changeActiveCompany, logout } from "./actions";
import { listAuditEvents } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";

const moduleCards = [
  {
    title: "Empresas",
    detail: "Selector de empresa activo y permisos por tenant.",
    href: "/admin/empresas"
  },
  {
    title: "Roles",
    detail: "Contador, asistente y cliente con alcance separado.",
    href: "/admin/usuarios"
  },
  {
    title: "Auditoria",
    detail: "Eventos criticos registrados por usuario y empresa.",
    href: "/"
  },
  {
    title: "Seguridad",
    detail: "Toda accion sensible valida acceso a empresa activa.",
    href: "/"
  },
  {
    title: "Plan de cuentas",
    detail: "Cuentas contables propias por empresa.",
    href: "/contabilidad/cuentas"
  },
  {
    title: "Periodos",
    detail: "Apertura y control de meses/ejercicios por empresa.",
    href: "/contabilidad/periodos"
  },
  {
    title: "Asientos",
    detail: "Borradores con control de partida doble.",
    href: "/contabilidad/asientos"
  }
];

export default async function Home() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const { session } = workspace;
  const activeTenant = getActiveTenantFromCompanies(session, workspace.companies);
  const allowedCompanyIds = new Set(
    session.memberships.map((membership) => membership.companyId)
  );
  const availableCompanies = workspace.companies.filter((company) =>
    allowedCompanyIds.has(company.id)
  );
  const auditEvents = listAuditEvents(activeTenant.company.id);

  return (
    <main className="workspace">
      <aside className="sidebar">
        <div>
          <p className="brand">MRASysCont</p>
          <h1>Operacion del estudio</h1>
        </div>

        <div className="signedUser">
          <span>Usuario activo</span>
          <strong>{session.user.name}</strong>
          <small>{session.user.email}</small>
        </div>

        <form action={changeActiveCompany} className="controlGroup">
          <label htmlFor="companyId">Empresa activa</label>
          <select
            id="companyId"
            name="companyId"
            defaultValue={activeTenant.company.id}
          >
            {availableCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.tradeName ?? company.legalName}
              </option>
            ))}
          </select>
          <button type="submit">Seleccionar empresa</button>
        </form>

        <form action={logout}>
          <button className="secondaryButton" type="submit">
            Cerrar sesion
          </button>
        </form>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <span className="eyeline">Fase 1</span>
            <h2>{activeTenant.company.legalName}</h2>
            <p>
              CUIT {activeTenant.company.cuit} · {activeTenant.company.taxCondition}
            </p>
          </div>
          <div className="roleStack">
            <div className="rolePill">{activeTenant.membership.role}</div>
            <span>{workspace.source === "database" ? "PostgreSQL" : "Demo local"}</span>
          </div>
        </header>

        <section className="moduleGrid" aria-label="Modulos de plataforma">
          {moduleCards.map((card) => (
            <a className="moduleCard" href={card.href} key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
            </a>
          ))}
        </section>

        <section className="split">
          <article className="panel">
            <h3>Permisos activos</h3>
            <ul className="permissionList">
              {Object.entries(activeTenant.membership.permissions).map(
                ([permission, enabled]) => (
                  <li key={permission} data-enabled={enabled}>
                    <span>{permission}</span>
                    <strong>{enabled ? "Permitido" : "Bloqueado"}</strong>
                  </li>
                )
              )}
            </ul>
          </article>

          <article className="panel">
            <h3>Auditoria reciente</h3>
            {auditEvents.length === 0 ? (
              <p className="emptyState">
                Todavia no hay eventos para esta empresa en memoria local.
              </p>
            ) : (
              <ul className="auditList">
                {auditEvents.map((event) => (
                  <li key={event.id}>
                    <span>{event.action}</span>
                    <time>{new Date(event.occurredAt).toLocaleString("es-AR")}</time>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}
