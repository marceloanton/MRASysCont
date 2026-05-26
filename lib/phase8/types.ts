import { Prisma } from "@prisma/client";

export type VatOperationType = "GRAVADA" | "EXENTA" | "NO_GRAVADA";
export type VatRate = "0" | "10.5" | "21" | "27";

export type VatBookRow = {
  voucherId: string;
  issueDate: string;
  direction: "EMITIDO" | "RECIBIDO";
  type: string;
  letter?: string;
  pointOfSale: string;
  number?: string;
  thirdPartyName: string;
  operationType: VatOperationType;
  vatRate: VatRate;
  taxableBase: number;
  exemptAmount: number;
  nonTaxedAmount: number;
  vatAmount: number;
  totalAmount: number;
};

export type VatMonthlyReport = {
  periodId?: string;
  salesTaxableBase: number;
  purchasesTaxableBase: number;
  salesVatDebitFiscal: number;
  purchasesVatCreditFiscal: number;
  salesExemptAmount: number;
  purchasesExemptAmount: number;
  salesNonTaxedAmount: number;
  purchasesNonTaxedAmount: number;
  netVatPayable: number;
};

export type VatReconciliation = {
  periodId?: string;
  expectedVatDebitFiscal: number;
  accountingVatDebitFiscal: number;
  expectedVatCreditFiscal: number;
  accountingVatCreditFiscal: number;
  debitDifference: number;
  creditDifference: number;
};

export type VatReportsResult = {
  source: "database" | "demo";
  salesBook: VatBookRow[];
  purchasesBook: VatBookRow[];
  monthly: VatMonthlyReport;
  reconciliation: VatReconciliation;
};

export type VatComputation = {
  operationType: VatOperationType;
  vatRate: VatRate;
  taxableBase: Prisma.Decimal;
  exemptAmount: Prisma.Decimal;
  nonTaxedAmount: Prisma.Decimal;
  vatAmount: Prisma.Decimal;
};
