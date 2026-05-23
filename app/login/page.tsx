import { redirect } from "next/navigation";
import { demoUsers } from "@/lib/phase1/demo-data";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { loginWithDemo } from "./actions";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const workspace = await getWorkspaceContext();

  if (workspace) {
    redirect("/");
  }

  return (
    <main className="loginPage">
      <section className="loginIntro">
        <p className="brand">MRASysCont</p>
        <h1>Ingreso seguro al estudio contable.</h1>
        <p>
          La sesion productiva se valida contra PostgreSQL. El modo demo queda
          disponible solo para desarrollo local mientras no exista base cargada.
        </p>
      </section>

      <section className="loginPanel" aria-label="Ingreso">
        <h2>Acceso</h2>
        <LoginForm />

        <div className="demoAccess">
          <h3>Modo demo local</h3>
          <div className="demoButtons">
            {demoUsers.map((user) => (
              <form action={loginWithDemo} key={user.id}>
                <input type="hidden" name="userId" value={user.id} />
                <button type="submit">{user.name}</button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
