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
    status: "CERRADO"
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
    reversedByEntryId: "entry_alfa_2",
    totalDebit: 100000,
    totalCredit: 100000,
    lines: [
      {
        accountId: "acc_caja",
        accountCode: "1.01.001",
        accountName: "Caja",
        debit: 100000,
        credit: 0
      },
      {
        accountId: "acc_ventas",
        accountCode: "4.01.001",
        accountName: "Ventas",
        debit: 0,
        credit: 100000
      }
    ]
  },
  {
    id: "entry_alfa_2",
    companyId: "emp_alfa",
    periodId: "period_alfa_2026_01",
    number: 2,
    date: "2026-01-11",
    description: "Contraasiento por anulacion: Venta de prueba",
    status: "CONFIRMADO",
    reversalOfEntryId: "entry_alfa_1",
    reversalReason: "Correccion de comprobante de prueba",
    totalDebit: 100000,
    totalCredit: 100000,
    lines: [
      {
        accountId: "acc_caja",
        accountCode: "1.01.001",
        accountName: "Caja",
        debit: 0,
        credit: 100000
      },
      {
        accountId: "acc_ventas",
        accountCode: "4.01.001",
        accountName: "Ventas",
        debit: 100000,
        credit: 0
      }
    ]
  },
  {
    id: "entry_alfa_3",
    companyId: "emp_alfa",
    periodId: "period_alfa_2026_01",
    number: 3,
    date: "2026-01-12",
    description: "Borrador de gasto a revisar",
    status: "BORRADOR",
    totalDebit: 25000,
    totalCredit: 25000,
    lines: [
      {
        accountId: "acc_banco",
        accountCode: "1.01.002",
        accountName: "Banco",
        debit: 0,
        credit: 25000
      },
      {
        accountId: "acc_caja",
        accountCode: "1.01.001",
        accountName: "Caja",
        debit: 25000,
        credit: 0
      }
    ]
  }
];
