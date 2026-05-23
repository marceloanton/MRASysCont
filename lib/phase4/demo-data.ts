import type { TreasuryAccountSummary, TreasuryMovementSummary } from "./types";

export const demoTreasuryMovements: TreasuryMovementSummary[] = [
  {
    id: "treasury_mov_alfa_1",
    companyId: "emp_alfa",
    treasuryAccountId: "treasury_alfa_caja",
    treasuryAccountName: "Caja principal",
    type: "INGRESO",
    date: "2026-01-20",
    currency: "ARS",
    amount: 21000,
    signedAmount: 21000,
    description: "Cobro parcial Cliente Demo",
    reference: "TRX-DEMO-001",
    reconciled: true,
    reconciledAt: "2026-01-21",
    reconciliationReference: "EXT-DEMO-001"
  },
  {
    id: "treasury_mov_alfa_2",
    companyId: "emp_alfa",
    treasuryAccountId: "treasury_alfa_banco",
    treasuryAccountName: "Banco operativo",
    type: "EGRESO",
    date: "2026-01-22",
    currency: "ARS",
    amount: 10000,
    signedAmount: -10000,
    description: "Pago parcial Proveedor Demo",
    reference: "TRX-DEMO-002",
    reconciled: false
  }
];

export const demoTreasuryAccounts: TreasuryAccountSummary[] = [
  {
    id: "treasury_alfa_caja",
    companyId: "emp_alfa",
    type: "CAJA",
    name: "Caja principal",
    currency: "ARS",
    active: true,
    balance: 21000
  },
  {
    id: "treasury_alfa_banco",
    companyId: "emp_alfa",
    type: "BANCO",
    name: "Banco operativo",
    currency: "ARS",
    bankName: "Banco Demo",
    accountNumber: "000-000001/1",
    active: true,
    balance: -10000
  }
];
