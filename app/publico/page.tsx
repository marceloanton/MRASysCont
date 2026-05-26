import Link from "next/link";
import Image from "next/image";

const shots = [
  { src: "/docs/screenshots/01-home.png", title: "Inicio" },
  { src: "/docs/screenshots/03-admin-empresas.png", title: "Empresas" },
  { src: "/docs/screenshots/06-comprobantes.png", title: "Comprobantes" },
  { src: "/docs/screenshots/08-contabilidad-reportes.png", title: "Reportes e IVA" }
];

const pillars = [
  {
    title: "Tenancy profesional",
    detail: "Aislamiento por Study, Client y Company con autorización backend por objeto."
  },
  {
    title: "Nucleo contable robusto",
    detail: "Asientos, periodos, cierres, Diario, Mayor y reglas de inmutabilidad."
  },
  {
    title: "Comprobantes + IVA base",
    detail: "Comprobantes locales, libros IVA ventas/compras y conciliacion con contabilidad."
  }
];

const modules = [
  "Gestion del estudio",
  "Terceros y cuentas corrientes",
  "Nucleo contable",
  "Expediente documental",
  "Multimoneda ARS/USD",
  "Comprobantes locales",
  "IVA base"
];

export default function PublicoPage() {
  return (
    <main className="landingPage">
      <section className="landingHero">
        <p className="landingKicker">MRASysCont</p>
        <h1>La plataforma integral para estudios contables argentinos</h1>
        <p>
          MRASysCont unifica gestión de estudio, operación contable y control fiscal
          en una sola solución, con trazabilidad y seguridad multi-tenant desde diseño.
        </p>
        <div className="landingCtas">
          <a href="mailto:marceloanton@outlook.com">Solicitar demo</a>
          <Link href="/login">Ingresar al sistema</Link>
        </div>
      </section>

      <section className="landingGrid">
        <article>
          <h2>Estado</h2>
          <p>Roadmap ejecutado hasta Fase 8 (IVA base) con quality gates en verde.</p>
        </article>
        <article>
          <h2>Modelo real de estudio</h2>
          <p>Jerarquía Study - Client - Company, con aislamiento operativo verificable.</p>
        </article>
        <article>
          <h2>Contacto comercial</h2>
          <p>marceloanton@outlook.com</p>
        </article>
      </section>

      <section className="landingPillars">
        {pillars.map((pillar) => (
          <article key={pillar.title}>
            <h3>{pillar.title}</h3>
            <p>{pillar.detail}</p>
          </article>
        ))}
      </section>

      <section className="landingModules">
        <h2>Capacidades actuales</h2>
        <ul>
          {modules.map((module) => (
            <li key={module}>{module}</li>
          ))}
        </ul>
      </section>

      <section className="landingShots">
        <h2>Capturas del producto</h2>
        <div>
          {shots.map((shot) => (
            <figure key={shot.title}>
              <Image
                src={shot.src}
                alt={shot.title}
                width={1600}
                height={900}
              />
              <figcaption>{shot.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="landingFooterCta">
        <h2>Queres una demo privada para tu estudio?</h2>
        <p>
          Escribinos y coordinamos una demostración guiada con flujo real de operación.
        </p>
        <a href="mailto:marceloanton@outlook.com">Contactar ahora</a>
      </section>
    </main>
  );
}
