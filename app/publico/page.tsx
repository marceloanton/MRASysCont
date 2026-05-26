import Link from "next/link";
import Image from "next/image";

const shots = [
  { src: "/docs/screenshots/01-home.png", title: "Inicio" },
  { src: "/docs/screenshots/03-admin-empresas.png", title: "Empresas" },
  { src: "/docs/screenshots/06-comprobantes.png", title: "Comprobantes" },
  { src: "/docs/screenshots/08-contabilidad-reportes.png", title: "Reportes e IVA" }
];

export default function PublicoPage() {
  return (
    <main className="landingPage">
      <section className="landingHero">
        <p className="landingKicker">MRASysCont</p>
        <h1>Plataforma contable para estudios argentinos</h1>
        <p>
          Gestion del estudio, contabilidad, comprobantes locales e IVA base en
          una sola plataforma, con aislamiento por tenant y trazabilidad.
        </p>
        <div className="landingCtas">
          <a href="mailto:marceloanton@outlook.com">Solicitar demo</a>
          <Link href="/login">Ingresar al sistema</Link>
        </div>
      </section>

      <section className="landingGrid">
        <article>
          <h2>Estado</h2>
          <p>Fases 0.6 a 8 cerradas en GO.</p>
        </article>
        <article>
          <h2>Tenancy real</h2>
          <p>Study - Client - Company con autorizacion por objeto en backend.</p>
        </article>
        <article>
          <h2>Contacto comercial</h2>
          <p>marceloanton@outlook.com</p>
        </article>
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
    </main>
  );
}
