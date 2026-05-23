const roadmapItems = [
  "Plataforma multi-empresa",
  "Nucleo contable",
  "Facturacion ARCA/AFIP",
  "Portal cliente",
  "Tesoreria y reportes"
];

export default function Home() {
  return (
    <main className="shell">
      <section className="intro">
        <div>
          <p className="label">MRASysCont</p>
          <h1>Sistema contable multi-empresa para estudios contables.</h1>
          <p className="summary">
            Base tecnica inicial lista para construir login, empresas, roles,
            contabilidad formal, facturacion ARCA/AFIP y portal cliente con
            aislamiento por empresa desde el primer dia.
          </p>
        </div>
        <div className="statusPanel" aria-label="Estado del proyecto">
          <span>Fase actual</span>
          <strong>0</strong>
          <p>Preparacion del proyecto y documentacion fuente.</p>
        </div>
      </section>

      <section className="grid" aria-label="Roadmap principal">
        {roadmapItems.map((item, index) => (
          <article className="phaseCard" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{item}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}
