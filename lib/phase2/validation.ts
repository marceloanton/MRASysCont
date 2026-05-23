import type { AccountType } from "./types";

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
