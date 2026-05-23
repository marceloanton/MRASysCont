import { describe, expect, it } from "vitest";
import {
  isVoucherDirection,
  isVoucherType,
  validatePositiveAmount,
  validateVoucherAmounts,
  validateVoucherNumber
} from "./validation";

describe("phase 3 validation", () => {
  it("validates voucher catalogs", () => {
    expect(isVoucherDirection("EMITIDO")).toBe(true);
    expect(isVoucherDirection("VENTA")).toBe(false);
    expect(isVoucherType("FACTURA")).toBe(true);
    expect(isVoucherType("REMITO")).toBe(false);
  });

  it("validates voucher numbering", () => {
    expect(validateVoucherNumber("0001")).toBe(true);
    expect(validateVoucherNumber("ABC1")).toBe(false);
  });

  it("requires total to match net plus taxes by cents", () => {
    expect(
      validateVoucherAmounts({
        netAmount: 100.1,
        taxAmount: 21.02,
        totalAmount: 121.12
      })
    ).toBe(true);
    expect(
      validateVoucherAmounts({
        netAmount: 100,
        taxAmount: 21,
        totalAmount: 120
      })
    ).toBe(false);
  });

  it("validates positive settlement amounts", () => {
    expect(validatePositiveAmount(1)).toBe(true);
    expect(validatePositiveAmount(0)).toBe(false);
    expect(validatePositiveAmount(-1)).toBe(false);
  });
});
