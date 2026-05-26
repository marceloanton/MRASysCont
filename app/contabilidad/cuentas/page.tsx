import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { listAccountChartTemplates, listAccounts } from "@/lib/phase4-accounting/repository";
import { applyAccountTemplateAction } from "./actions";
import { AccountForm } from "./account-form";

export default async function AccountsPage() {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    redirect("/login");
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const canManage = tenant.membership.permissions.manageSettings;
  const [result, templates] = await Promise.all([
    listAccounts(tenant.company.studyId, tenant.company.id),
    listAccountChartTemplates()
  ]);

  return (
    <main className="adminPage">
      <header className="adminHeader">
        <div>
          <Link href="/">Volver</Link>
          <p className="eyeline">Fase 2</p>
          <h1>Plan de cuentas</h1>
          <p>{tenant.company.legalName}</p>
        </div>
        <span>{result.source === "database" ? "PostgreSQL" : "Demo local"}</span>
      </header>

      <section className="adminGrid">
        <article className="panel">
          <h2>Nueva cuenta</h2>
          {canManage ? (
            <form action={applyAccountTemplateAction} className="inlineAction">
              <select name="templateId" defaultValue={templates[0]?.id}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              <button className="tableButton" type="submit">
                Aplicar plantilla
              </button>
            </form>
          ) : null}
          {canManage ? (
            <AccountForm />
          ) : (
            <p className="emptyState">Tu rol no permite modificar cuentas.</p>
          )}
        </article>

        <article className="panel">
          <h2>Cuentas de la empresa</h2>
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Imputable</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {result.accounts.map((account) => (
                  <tr key={account.id}>
                    <td>{account.code}</td>
                    <td>{account.name}</td>
                    <td>{account.type}</td>
                    <td>{account.imputable ? "Si" : "No"}</td>
                    <td>{account.active ? "Activa" : "Inactiva"}</td>
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
