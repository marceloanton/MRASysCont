import { describe, expect, it } from "vitest";
import { isAccountType, validateAccountCode, validatePeriodRange } from "./validation";

describe("accounting validation", () => {
  it("accepts hierarchical numeric account codes", () => {
    expect(validateAccountCode("1")).toBe(true);
    expect(validateAccountCode("1.01.001")).toBe(true);
  });

  it("rejects invalid account codes", () => {
    expect(validateAccountCode("ventas")).toBe(false);
    expect(validateAccountCode("1..01")).toBe(false);
  });

  it("validates account types", () => {
    expect(isAccountType("ACTIVO")).toBe(true);
    expect(isAccountType("VENTAS")).toBe(false);
  });

  it("requires period start before end", () => {
    expect(validatePeriodRange(new Date("2026-01-01"), new Date("2026-01-31"))).toBe(true);
    expect(validatePeriodRange(new Date("2026-02-01"), new Date("2026-01-31"))).toBe(false);
  });
});
