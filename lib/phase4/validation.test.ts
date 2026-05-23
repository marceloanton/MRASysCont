import { describe, expect, it } from "vitest";
import {
  isTreasuryAccountType,
  isTreasuryMovementType,
  signedTreasuryAmount,
  validateTreasuryAmount
} from "./validation";

describe("treasury validation", () => {
  it("validates treasury catalogs", () => {
    expect(isTreasuryAccountType("CAJA")).toBe(true);
    expect(isTreasuryAccountType("CUENTA")).toBe(false);
    expect(isTreasuryMovementType("INGRESO")).toBe(true);
    expect(isTreasuryMovementType("SALIDA")).toBe(false);
  });

  it("validates non-zero amounts", () => {
    expect(validateTreasuryAmount(1)).toBe(true);
    expect(validateTreasuryAmount(0)).toBe(false);
  });

  it("signs movement amounts", () => {
    expect(signedTreasuryAmount("INGRESO", 100)).toBe(100);
    expect(signedTreasuryAmount("EGRESO", 100)).toBe(-100);
    expect(signedTreasuryAmount("AJUSTE", -50)).toBe(-50);
  });
});
