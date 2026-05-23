import type { AccountType } from "./types";
import type { AccountingPeriodSummary, AccountSummary, JournalEntryLineInput } from "./types";

export const accountTypes: AccountType[] = [
  "ACTIVO",
  "PASIVO",
  "PATRIMONIO",
  "INGRESOS",
  "EGRESOS",
  "ORDEN"
];

export function isAccountType(value: string): value is AccountType {
  return accountTypes.includes(value as AccountType);
}

export function validateAccountCode(code: string) {
  return /^[0-9]+(\.[0-9]+)*$/.test(code.trim());
}

export function validatePeriodRange(startsAt: Date, endsAt: Date) {
  return startsAt instanceof Date && endsAt instanceof Date && startsAt < endsAt;
}

export function sumJournalLines(lines: JournalEntryLineInput[]) {
  return lines.reduce(
    (totals, line) => ({
      debit: totals.debit + line.debit,
      credit: totals.credit + line.credit
    }),
    {
      debit: 0,
      credit: 0
    }
  );
}

export function validateBalancedEntry(lines: JournalEntryLineInput[]) {
  const totals = sumJournalLines(lines);
  const validLines = lines.every(
    (line) =>
      line.accountId &&
      line.debit >= 0 &&
      line.credit >= 0 &&
      ((line.debit > 0 && line.credit === 0) || (line.credit > 0 && line.debit === 0))
  );

  return lines.length >= 2 && validLines && totals.debit > 0 && totals.debit === totals.credit;
}

export function validateEntryAccountsBelongToCompany(
  lines: JournalEntryLineInput[],
  accounts: AccountSummary[],
  companyId: string
) {
  const allowedAccounts = new Set(
    accounts
      .filter((account) => account.companyId === companyId && account.active && account.imputable)
      .map((account) => account.id)
  );

  return lines.every((line) => allowedAccounts.has(line.accountId));
}

export function validateOpenPeriod(
  periodId: string,
  periods: AccountingPeriodSummary[],
  companyId: string
) {
  return periods.some(
    (period) =>
      period.id === periodId &&
      period.companyId === companyId &&
      period.status === "ABIERTO"
  );
}
