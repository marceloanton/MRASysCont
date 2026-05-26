import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.resolve("docs/screenshots");

const pages = [
  ["01-home", "/"],
  ["02-admin-estudios", "/admin/estudios"],
  ["03-admin-empresas", "/admin/empresas"],
  ["04-estudio-clientes", "/estudio/clientes"],
  ["05-terceros", "/terceros"],
  ["06-comprobantes", "/comprobantes"],
  ["07-contabilidad-asientos", "/contabilidad/asientos"],
  ["08-contabilidad-reportes", "/contabilidad/reportes"]
];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });

await context.addCookies([
  { name: "mrasyscont_demo_user", value: "usr_contador", url: baseUrl },
  { name: "mrasyscont_demo_study", value: "std_default", url: baseUrl },
  { name: "mrasyscont_demo_company", value: "emp_alfa", url: baseUrl }
]);

const page = await context.newPage();
for (const [name, route] of pages) {
  const url = `${baseUrl}${route}`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: true });
  console.log(`captured ${route}`);
}

await browser.close();
