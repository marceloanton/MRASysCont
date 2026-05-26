import { Prisma } from "@prisma/client";

export type FxPostingInput = {
  currency: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  exchangeRate?: number;
  studyId?: string | null;
  companyId?: string | null;
};

export function roundFxToArs(value: Prisma.Decimal) {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

export function validateFxPosting(input: FxPostingInput) {
  const currency = input.currency.trim().toUpperCase();
  if (currency !== "ARS" && currency !== "USD") {
    return { ok: false, message: "Moneda no soportada. Solo ARS/USD." };
  }

  if (currency === "USD") {
    if (!input.exchangeRate || !Number.isFinite(input.exchangeRate) || input.exchangeRate <= 0) {
      return { ok: false, message: "USD requiere tipo de cambio positivo." };
    }
    if (!Number.isFinite(input.totalAmount) || input.totalAmount <= 0) {
      return { ok: false, message: "USD requiere importe original total." };
    }
  }

  return { ok: true as const };
}

export function buildArsAmounts(input: FxPostingInput) {
  const currency = input.currency.trim().toUpperCase();
  if (currency === "ARS") {
    return {
      netArs: new Prisma.Decimal(input.netAmount),
      taxArs: new Prisma.Decimal(input.taxAmount),
      totalArs: new Prisma.Decimal(input.totalAmount)
    };
  }

  const rate = new Prisma.Decimal(input.exchangeRate ?? 0);
  const net = roundFxToArs(new Prisma.Decimal(input.netAmount).times(rate));
  const tax = roundFxToArs(new Prisma.Decimal(input.taxAmount).times(rate));
  const total = roundFxToArs(new Prisma.Decimal(input.totalAmount).times(rate));

  return {
    netArs: net,
    taxArs: tax,
    totalArs: total
  };
}

export function hasFxTenantScope(input: { studyId?: string | null; companyId?: string | null }) {
  return Boolean(input.studyId && input.companyId);
}

export function canAccessFxEntryFromCompany(input: {
  actorStudyId: string;
  actorCompanyId: string;
  entryStudyId: string;
  entryCompanyId: string;
}) {
  return input.actorStudyId === input.entryStudyId && input.actorCompanyId === input.entryCompanyId;
}
