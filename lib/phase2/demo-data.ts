import type { AccountingPeriodSummary, AccountSummary, JournalEntrySummary } from "./types";

export const demoAccounts: AccountSummary[] = [
  {
    id: "acc_caja",
    companyId: "emp_alfa",
    code: "1.01.001",
    name: "Caja",
    type: "ACTIVO",
    imputable: true,
    active: true
  },
  {
    id: "acc_banco",
    companyId: "emp_alfa",
    code: "1.01.002",
    name: "Banco",
    type: "ACTIVO",
    imputable: true,
    active: true
  },
  {
    id: "acc_ventas",
    companyId: "emp_alfa",
    code: "4.01.001",
    name: "Ventas",
    type: "INGRESOS",
    imputable: true,
    active: true
  },
  {
    id: "acc_caja_gamma",
    companyId: "emp_gamma",
    code: "1.01.001",
    name: "Caja",
    type: "ACTIVO",
    imputable: true,
    active: true
  }
];

export const demoPeriods: AccountingPeriodSummary[] = [
  {
    id: "period_alfa_2026_01",
    companyId: "emp_alfa",
    name: "Enero 2026",
    startsAt: "2026-01-01",
    endsAt: "2026-01-31",
    status: "ABIERTO"
  },
  {
    id: "period_alfa_2026_02",
    companyId: "emp_alfa",
    name: "Febrero 2026",
    startsAt: "2026-02-01",
    endsAt: "2026-02-28",
    status: "ABIERTO"
  },
  {
    id: "period_gamma_2026_01",
    companyId: "emp_gamma",
    name: "Enero 2026",
    startsAt: "2026-01-01",
    endsAt: "2026-01-31",
    status: "ABIERTO"
  }
];

export const demoJournalEntries: JournalEntrySummary[] = [
  {
    id: "entry_alfa_1",
    companyId: "emp_alfa",
    periodId: "period_alfa_2026_01",
    number: 1,
    date: "2026-01-10",
    description: "Venta de prueba",
    status: "CONFIRMADO",
    totalDebit: 100000,
    totalCredit: 100000
  }
];
