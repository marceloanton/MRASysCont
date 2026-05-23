import { demoAccounts, demoJournalEntries } from "./demo-data";
import type { JournalReportLine } from "./types";

const accountById = new Map(demoAccounts.map((account) => [account.id, account]));

export const demoJournalReportLines: JournalReportLine[] = [
  {
    entryId: "entry_alfa_1",
    number: 1,
    date: "2026-01-10",
    description: "Venta de prueba",
    accountCode: accountById.get("acc_caja")?.code ?? "1.01.001",
    accountName: accountById.get("acc_caja")?.name ?? "Caja",
    debit: 100000,
    credit: 0
  },
  {
    entryId: "entry_alfa_1",
    number: 1,
    date: "2026-01-10",
    description: "Venta de prueba",
    accountCode: accountById.get("acc_ventas")?.code ?? "4.01.001",
    accountName: accountById.get("acc_ventas")?.name ?? "Ventas",
    debit: 0,
    credit: 100000
  },
  {
    entryId: "entry_alfa_2",
    number: 2,
    date: "2026-01-11",
    description: "Contraasiento por anulacion: Venta de prueba",
    accountCode: accountById.get("acc_caja")?.code ?? "1.01.001",
    accountName: accountById.get("acc_caja")?.name ?? "Caja",
    debit: 0,
    credit: 100000
  },
  {
    entryId: "entry_alfa_2",
    number: 2,
    date: "2026-01-11",
    description: "Contraasiento por anulacion: Venta de prueba",
    accountCode: accountById.get("acc_ventas")?.code ?? "4.01.001",
    accountName: accountById.get("acc_ventas")?.name ?? "Ventas",
    debit: 100000,
    credit: 0
  }
].filter((line) =>
  demoJournalEntries.some((entry) => entry.id === line.entryId && entry.companyId === "emp_alfa")
);
