import { changeActiveCompany, changeDemoUser } from "./actions";
import { listAuditEvents } from "@/lib/phase1/audit";
import { demoCompanies, demoUsers } from "@/lib/phase1/demo-data";
import { getSessionContext } from "@/lib/phase1/session";
import { getActiveTenant } from "@/lib/phase1/tenant-access";

const moduleCards = [
  {
    title: "Empresas",
    detail: "Selector de empresa activo y permisos por tenant."
  },
  {
    title: "Roles",
    detail: "Contador, asistente y cliente con alcance separado."
  },
  {
    title: "Auditoria",
    detail: "Eventos criticos registrados por usuario y empresa."
  },
  {
    title: "Seguridad",
    detail: "Toda accion sensible valida acceso a empresa activa."
  }
];

export default async function Home() {
  const session = await getSessionContext();
  const activeTenant = getActiveTenant(session);
  const allowedCompanyIds = new Set(
    session.memberships.map((membership) => membership.companyId)
  );
  const availableCompanies = demoCompanies.filter((company) =>
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

        <form action={changeDemoUser} className="controlGroup">
          <label htmlFor="userId">Usuario demo</label>
          <select id="userId" name="userId" defaultValue={session.user.id}>
            {demoUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <button type="submit">Cambiar usuario</button>
        </form>

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
          <div className="rolePill">{activeTenant.membership.role}</div>
        </header>

        <section className="moduleGrid" aria-label="Modulos de plataforma">
          {moduleCards.map((card) => (
            <article className="moduleCard" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.detail}</p>
            </article>
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
