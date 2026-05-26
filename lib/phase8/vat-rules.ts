import { Prisma } from "@prisma/client";
import type { VatComputation, VatOperationType, VatRate } from "./types";

const TWO = new Prisma.Decimal(2);
const HUNDRED = new Prisma.Decimal(100);

export const allowedVatRates: VatRate[] = ["0", "10.5", "21", "27"];

export function hasVatTenantScope(input: {
  studyId?: string | null;
  companyId?: string | null;
  periodId?: string | null;
}) {
  return Boolean(input.studyId && input.companyId && input.periodId);
}

export function canAccessVatBookFromCompany(input: {
  actorStudyId: string;
  actorCompanyId: string;
  targetStudyId: string;
  targetCompanyId: string;
}) {
  return input.actorStudyId === input.targetStudyId && input.actorCompanyId === input.targetCompanyId;
}

export function isValidVatOperationType(value: string): value is VatOperationType {
  return value === "GRAVADA" || value === "EXENTA" || value === "NO_GRAVADA";
}

export function isValidVatRateForTaxedOperation(rate: VatRate, operationType: VatOperationType) {
  if (operationType !== "GRAVADA") {
    return rate === "0";
  }

  return rate === "10.5" || rate === "21" || rate === "27";
}

function parseTag(notes: string, key: string) {
  const regex = new RegExp(`\\[${key}:([^\\]]+)\\]`, "i");
  const match = notes.match(regex);
  return match?.[1]?.trim();
}

function normalizeRate(value: Prisma.Decimal): VatRate | null {
  const str = value.toDecimalPlaces(1, Prisma.Decimal.ROUND_HALF_UP).toString();
  if (str === "10.5") return "10.5";
  if (str === "21.0" || str === "21") return "21";
  if (str === "27.0" || str === "27") return "27";
  if (str === "0.0" || str === "0") return "0";
  return null;
}

function inferOperationType(input: {
  notes?: string | null;
  vatAmount: Prisma.Decimal;
}): VatOperationType {
  const notes = (input.notes ?? "").toLowerCase();
  const tagged = parseTag(notes, "vat");
  if (tagged) {
    const normalized = tagged.toUpperCase();
    if (normalized === "GRAVADA" || normalized === "EXENTA" || normalized === "NO_GRAVADA") {
      return normalized;
    }
  }

  if (input.vatAmount.gt(0)) return "GRAVADA";
  if (notes.includes("exenta")) return "EXENTA";
  return "NO_GRAVADA";
}

function inferVatRate(input: {
  notes?: string | null;
  netAmount: Prisma.Decimal;
  vatAmount: Prisma.Decimal;
}): VatRate {
  const notes = input.notes ?? "";
  const explicit = parseTag(notes, "vat-rate");
  if (explicit) {
    const normalized = normalizeRate(new Prisma.Decimal(explicit));
    if (normalized) return normalized;
  }

  if (input.vatAmount.lte(0) || input.netAmount.lte(0)) {
    return "0";
  }

  const computed = input.vatAmount.times(HUNDRED).div(input.netAmount);
  return normalizeRate(computed) ?? "0";
}

export function computeVatFromVoucher(input: {
  netAmount: Prisma.Decimal;
  vatAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
  notes?: string | null;
}): VatComputation {
  const operationType = inferOperationType({
    notes: input.notes,
    vatAmount: input.vatAmount
  });
  const vatRate = inferVatRate({
    notes: input.notes,
    netAmount: input.netAmount,
    vatAmount: input.vatAmount
  });

  if (operationType === "GRAVADA") {
    return {
      operationType,
      vatRate,
      taxableBase: input.netAmount.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
      exemptAmount: new Prisma.Decimal(0),
      nonTaxedAmount: new Prisma.Decimal(0),
      vatAmount: input.vatAmount.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
    };
  }

  if (operationType === "EXENTA") {
    return {
      operationType,
      vatRate: "0",
      taxableBase: new Prisma.Decimal(0),
      exemptAmount: input.totalAmount.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
      nonTaxedAmount: new Prisma.Decimal(0),
      vatAmount: new Prisma.Decimal(0)
    };
  }

  return {
    operationType,
    vatRate: "0",
    taxableBase: new Prisma.Decimal(0),
    exemptAmount: new Prisma.Decimal(0),
    nonTaxedAmount: input.totalAmount.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP),
    vatAmount: new Prisma.Decimal(0)
  };
}

export function vatReconciliationMatchesConfirmedAccountingEntries(input: {
  expectedVatDebitFiscal: Prisma.Decimal;
  accountingVatDebitFiscal: Prisma.Decimal;
  expectedVatCreditFiscal: Prisma.Decimal;
  accountingVatCreditFiscal: Prisma.Decimal;
}) {
  return (
    input.expectedVatDebitFiscal.toDecimalPlaces(2).equals(input.accountingVatDebitFiscal.toDecimalPlaces(2)) &&
    input.expectedVatCreditFiscal.toDecimalPlaces(2).equals(input.accountingVatCreditFiscal.toDecimalPlaces(2))
  );
}

export function toMoneyNumber(value: Prisma.Decimal) {
  return Number(value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP).toString());
}

export function ensureRateForOperationType(input: {
  operationType: VatOperationType;
  vatRate: VatRate;
}) {
  return isValidVatRateForTaxedOperation(input.vatRate, input.operationType);
}

export function zero() {
  return new Prisma.Decimal(0).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export { Prisma, TWO };
