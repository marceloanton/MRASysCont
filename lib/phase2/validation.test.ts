import { describe, expect, it } from "vitest";
import {
  isAccountType,
  validateAccountCode,
  validateBalancedEntry,
  validateEntryAccountsBelongToCompany,
  validateOpenPeriod,
  validatePeriodRange
} from "./validation";

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

  it("requires balanced journal entries", () => {
    expect(
      validateBalancedEntry([
        { accountId: "a", debit: 100, credit: 0 },
        { accountId: "b", debit: 0, credit: 100 }
      ])
    ).toBe(true);
    expect(
      validateBalancedEntry([
        { accountId: "a", debit: 100, credit: 0 },
        { accountId: "b", debit: 0, credit: 90 }
      ])
    ).toBe(false);
  });

  it("rejects accounts from another company", () => {
    const accounts = [
      {
        id: "a",
        companyId: "emp_a",
        code: "1",
        name: "Caja",
        type: "ACTIVO" as const,
        imputable: true,
        active: true
      },
      {
        id: "b",
        companyId: "emp_b",
        code: "2",
        name: "Ventas",
        type: "INGRESOS" as const,
        imputable: true,
        active: true
      }
    ];

    expect(
      validateEntryAccountsBelongToCompany(
        [
          { accountId: "a", debit: 100, credit: 0 },
          { accountId: "b", debit: 0, credit: 100 }
        ],
        accounts,
        "emp_a"
      )
    ).toBe(false);
  });

  it("requires open periods from the same company", () => {
    const periods = [
      {
        id: "period_a",
        companyId: "emp_a",
        name: "Enero",
        startsAt: "2026-01-01",
        endsAt: "2026-01-31",
        status: "ABIERTO" as const
      }
    ];

    expect(validateOpenPeriod("period_a", periods, "emp_a")).toBe(true);
    expect(validateOpenPeriod("period_a", periods, "emp_b")).toBe(false);
  });
});
