import "server-only";

import { prisma } from "@/lib/prisma";
import {
  Prisma,
  canAccessVatBookFromCompany,
  computeVatFromVoucher,
  ensureRateForOperationType,
  hasVatTenantScope,
  toMoneyNumber,
  vatReconciliationMatchesConfirmedAccountingEntries,
  zero
} from "./vat-rules";
import type { VatBookRow, VatMonthlyReport, VatReportsResult } from "./types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sumDecimals(values: Prisma.Decimal[]) {
  return values.reduce((acc, value) => acc.plus(value), zero());
}

function filterByDirection(rows: VatBookRow[], direction: "EMITIDO" | "RECIBIDO") {
  return rows.filter((row) => row.direction === direction);
}

export async function getVatReports(input: {
  studyId: string;
  companyId: string;
  periodId?: string;
}): Promise<VatReportsResult> {
  if (!hasDatabase()) {
    return {
      source: "demo",
      salesBook: [],
      purchasesBook: [],
      monthly: {
        periodId: input.periodId,
        salesTaxableBase: 0,
        purchasesTaxableBase: 0,
        salesVatDebitFiscal: 0,
        purchasesVatCreditFiscal: 0,
        salesExemptAmount: 0,
        purchasesExemptAmount: 0,
        salesNonTaxedAmount: 0,
        purchasesNonTaxedAmount: 0,
        netVatPayable: 0
      },
      reconciliation: {
        periodId: input.periodId,
        expectedVatDebitFiscal: 0,
        accountingVatDebitFiscal: 0,
        expectedVatCreditFiscal: 0,
        accountingVatCreditFiscal: 0,
        debitDifference: 0,
        creditDifference: 0
      }
    };
  }

  const period = input.periodId
    ? await prisma.accountingPeriod.findFirst({
        where: {
          id: input.periodId,
          studyId: input.studyId,
          companyId: input.companyId
        }
      })
    : null;

  if (input.periodId && !period) {
    return {
      source: "database",
      salesBook: [],
      purchasesBook: [],
      monthly: {
        periodId: input.periodId,
        salesTaxableBase: 0,
        purchasesTaxableBase: 0,
        salesVatDebitFiscal: 0,
        purchasesVatCreditFiscal: 0,
        salesExemptAmount: 0,
        purchasesExemptAmount: 0,
        salesNonTaxedAmount: 0,
        purchasesNonTaxedAmount: 0,
        netVatPayable: 0
      },
      reconciliation: {
        periodId: input.periodId,
        expectedVatDebitFiscal: 0,
        accountingVatDebitFiscal: 0,
        expectedVatCreditFiscal: 0,
        accountingVatCreditFiscal: 0,
        debitDifference: 0,
        creditDifference: 0
      }
    };
  }

  const vouchers = await prisma.voucher.findMany({
    where: {
      studyId: input.studyId,
      companyId: input.companyId,
      status: "REGISTRADO",
      ...(period
        ? {
            issueDate: {
              gte: period.startsAt,
              lte: period.endsAt
            }
          }
        : {})
    },
    include: {
      thirdParty: true
    },
    orderBy: [{ issueDate: "asc" }, { pointOfSale: "asc" }, { number: "asc" }]
  });

  const vatRows: VatBookRow[] = vouchers
    .filter((voucher) =>
      canAccessVatBookFromCompany({
        actorStudyId: input.studyId,
        actorCompanyId: input.companyId,
        targetStudyId: voucher.studyId ?? input.studyId,
        targetCompanyId: voucher.companyId
      })
    )
    .map((voucher) => {
      const computed = computeVatFromVoucher({
        netAmount: voucher.netAmount,
        vatAmount: voucher.taxAmount,
        totalAmount: voucher.totalAmount,
        notes: voucher.notes
      });

      const operationType = computed.operationType;
      const vatRate = ensureRateForOperationType({
        operationType,
        vatRate: computed.vatRate
      })
        ? computed.vatRate
        : "0";

      return {
        voucherId: voucher.id,
        issueDate: normalizeDate(voucher.issueDate),
        direction: voucher.direction,
        type: voucher.type,
        letter: voucher.letter ?? undefined,
        pointOfSale: voucher.pointOfSale,
        number: voucher.number ?? undefined,
        thirdPartyName: voucher.thirdParty.legalName,
        operationType,
        vatRate,
        taxableBase: toMoneyNumber(computed.taxableBase),
        exemptAmount: toMoneyNumber(computed.exemptAmount),
        nonTaxedAmount: toMoneyNumber(computed.nonTaxedAmount),
        vatAmount: toMoneyNumber(computed.vatAmount),
        totalAmount: toMoneyNumber(voucher.totalAmount)
      };
    });

  const salesBook = filterByDirection(vatRows, "EMITIDO");
  const purchasesBook = filterByDirection(vatRows, "RECIBIDO");

  const salesTaxableBase = sumDecimals(salesBook.map((row) => new Prisma.Decimal(row.taxableBase)));
  const purchasesTaxableBase = sumDecimals(
    purchasesBook.map((row) => new Prisma.Decimal(row.taxableBase))
  );
  const salesVatDebitFiscal = sumDecimals(salesBook.map((row) => new Prisma.Decimal(row.vatAmount)));
  const purchasesVatCreditFiscal = sumDecimals(
    purchasesBook.map((row) => new Prisma.Decimal(row.vatAmount))
  );
  const salesExemptAmount = sumDecimals(salesBook.map((row) => new Prisma.Decimal(row.exemptAmount)));
  const purchasesExemptAmount = sumDecimals(
    purchasesBook.map((row) => new Prisma.Decimal(row.exemptAmount))
  );
  const salesNonTaxedAmount = sumDecimals(
    salesBook.map((row) => new Prisma.Decimal(row.nonTaxedAmount))
  );
  const purchasesNonTaxedAmount = sumDecimals(
    purchasesBook.map((row) => new Prisma.Decimal(row.nonTaxedAmount))
  );

  const ivaAccounts = await prisma.account.findMany({
    where: {
      studyId: input.studyId,
      companyId: input.companyId,
      OR: [{ code: "2.03.001" }, { code: "2.03.002" }]
    },
    select: {
      id: true,
      code: true
    }
  });

  const debitFiscalAccount = ivaAccounts.find((account) => account.code === "2.03.001");
  const creditFiscalAccount = ivaAccounts.find((account) => account.code === "2.03.002");

  const accountingLines = await prisma.journalEntryLine.findMany({
    where: {
      journalEntry: {
        studyId: input.studyId,
        companyId: input.companyId,
        status: "CONFIRMADO",
        ...(input.periodId ? { periodId: input.periodId } : {})
      },
      OR: [
        ...(debitFiscalAccount ? [{ accountId: debitFiscalAccount.id }] : []),
        ...(creditFiscalAccount ? [{ accountId: creditFiscalAccount.id }] : [])
      ]
    },
    select: {
      accountId: true,
      debit: true,
      credit: true
    }
  });

  const accountingVatDebitFiscal = sumDecimals(
    accountingLines
      .filter((line) => line.accountId === debitFiscalAccount?.id)
      .map((line) => line.credit.minus(line.debit))
  );
  const accountingVatCreditFiscal = sumDecimals(
    accountingLines
      .filter((line) => line.accountId === creditFiscalAccount?.id)
      .map((line) => line.debit.minus(line.credit))
  );

  const monthly: VatMonthlyReport = {
    periodId: input.periodId,
    salesTaxableBase: toMoneyNumber(salesTaxableBase),
    purchasesTaxableBase: toMoneyNumber(purchasesTaxableBase),
    salesVatDebitFiscal: toMoneyNumber(salesVatDebitFiscal),
    purchasesVatCreditFiscal: toMoneyNumber(purchasesVatCreditFiscal),
    salesExemptAmount: toMoneyNumber(salesExemptAmount),
    purchasesExemptAmount: toMoneyNumber(purchasesExemptAmount),
    salesNonTaxedAmount: toMoneyNumber(salesNonTaxedAmount),
    purchasesNonTaxedAmount: toMoneyNumber(purchasesNonTaxedAmount),
    netVatPayable: toMoneyNumber(salesVatDebitFiscal.minus(purchasesVatCreditFiscal))
  };

  const expectedDebit = salesVatDebitFiscal;
  const expectedCredit = purchasesVatCreditFiscal;
  vatReconciliationMatchesConfirmedAccountingEntries({
    expectedVatDebitFiscal: expectedDebit,
    accountingVatDebitFiscal,
    expectedVatCreditFiscal: expectedCredit,
    accountingVatCreditFiscal
  });

  return {
    source: "database",
    salesBook,
    purchasesBook,
    monthly,
    reconciliation: {
      periodId: input.periodId,
      expectedVatDebitFiscal: toMoneyNumber(expectedDebit),
      accountingVatDebitFiscal: toMoneyNumber(accountingVatDebitFiscal),
      expectedVatCreditFiscal: toMoneyNumber(expectedCredit),
      accountingVatCreditFiscal: toMoneyNumber(accountingVatCreditFiscal),
      debitDifference: toMoneyNumber(expectedDebit.minus(accountingVatDebitFiscal)),
      creditDifference: toMoneyNumber(expectedCredit.minus(accountingVatCreditFiscal))
    }
  };
}

export function ensureVatScope(input: {
  studyId?: string | null;
  companyId?: string | null;
  periodId?: string | null;
}) {
  return hasVatTenantScope(input);
}

export function isVatReconciliationOk(input: VatReportsResult) {
  return (
    input.reconciliation.debitDifference === 0 &&
    input.reconciliation.creditDifference === 0
  );
}
