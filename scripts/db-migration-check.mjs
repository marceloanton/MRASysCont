import { execSync } from "node:child_process";
import net from "node:net";

function run(command) {
  execSync(command, { stdio: "inherit" });
}

function checkPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (ok) => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(ok);
      }
    };

    socket.setTimeout(2000);
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
    socket.once("timeout", () => finish(false));
    socket.connect(port, host);
  });
}

try {
  const dbUp = await checkPort("localhost", 5432);
  if (!dbUp) {
    throw new Error("DB_DOWN");
  }
  run("prisma validate");
  run("prisma migrate status");
} catch {
  console.error("\n[db:migration:check] No se pudo validar migraciones contra la DB local.");
  console.error(
    "[db:migration:check] Asegura PostgreSQL en localhost:5432. Sugerido: npm run db:up"
  );
  process.exit(1);
}
