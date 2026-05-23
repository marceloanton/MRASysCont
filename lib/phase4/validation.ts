import type { TreasuryAccountType, TreasuryMovementType } from "./types";

export const treasuryAccountTypes: TreasuryAccountType[] = ["CAJA", "BANCO", "BILLETERA"];
export const treasuryMovementTypes: TreasuryMovementType[] = [
  "INGRESO",
  "EGRESO",
  "TRANSFERENCIA",
  "AJUSTE"
];

export function isTreasuryAccountType(value: string): value is TreasuryAccountType {
  return treasuryAccountTypes.includes(value as TreasuryAccountType);
}

export function isTreasuryMovementType(value: string): value is TreasuryMovementType {
  return treasuryMovementTypes.includes(value as TreasuryMovementType);
}

export function validateTreasuryAmount(amount: number) {
  return Number.isFinite(amount) && Math.round(Math.abs(amount) * 100) > 0;
}

export function signedTreasuryAmount(type: TreasuryMovementType, amount: number) {
  if (type === "EGRESO") {
    return -Math.abs(amount);
  }

  if (type === "AJUSTE") {
    return amount;
  }

  return Math.abs(amount);
}
