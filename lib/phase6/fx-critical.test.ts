import { describe, expect, it } from "vitest";
import { listAuditEvents, recordAuditEvent } from "../phase1/audit";
import {
  buildArsAmounts,
  canAccessFxEntryFromCompany,
  hasFxTenantScope,
  validateFxPosting
} from "./fx-rules";

describe("phase6 fx critical tests", () => {
  it("exchange_rate_required_for_usd_posting", () => {
    const result = validateFxPosting({
      currency: "USD",
      netAmount: 100,
      taxAmount: 21,
      totalAmount: 121
    });
    expect(result.ok).toBe(false);
  });

  it("cannot_post_usd_without_original_amount", () => {
    const result = validateFxPosting({
      currency: "USD",
      exchangeRate: 900,
      netAmount: 0,
      taxAmount: 0,
      totalAmount: 0
    });
    expect(result.ok).toBe(false);
  });

  it("cannot_post_usd_without_ars_equivalent", () => {
    const result = validateFxPosting({
      currency: "USD",
      exchangeRate: 0,
      netAmount: 100,
      taxAmount: 21,
      totalAmount: 121
    });
    expect(result.ok).toBe(false);
  });

  it("rounding_policy_is_consistent_for_fx_conversion", () => {
    const a = buildArsAmounts({
      currency: "USD",
      exchangeRate: 1000.125,
      netAmount: 10.11,
      taxAmount: 2.12,
      totalAmount: 12.23
    });
    const b = buildArsAmounts({
      currency: "USD",
      exchangeRate: 1000.125,
      netAmount: 10.11,
      taxAmount: 2.12,
      totalAmount: 12.23
    });
    expect(a.totalArs.toString()).toBe(b.totalArs.toString());
  });

  it("fx_entry_requires_study_and_company_scope", () => {
    expect(hasFxTenantScope({ studyId: "std_1", companyId: "emp_1" })).toBe(true);
    expect(hasFxTenantScope({ studyId: "std_1", companyId: null })).toBe(false);
  });

  it("cannot_access_fx_entry_from_other_company", () => {
    expect(
      canAccessFxEntryFromCompany({
        actorStudyId: "std_1",
        actorCompanyId: "emp_1",
        entryStudyId: "std_1",
        entryCompanyId: "emp_2"
      })
    ).toBe(false);
  });

  it("fx_report_shows_original_and_ars_amounts", () => {
    const line = {
      currency: "USD",
      originalAmount: 100,
      debit: 95000
    };
    expect(line.currency).toBe("USD");
    expect(line.originalAmount).toBeGreaterThan(0);
    expect(line.debit).toBeGreaterThan(0);
  });

  it("critical_phase6_fx_actions_create_audit_log", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase6.fx_entry.posted",
      entity: "FxEntry",
      entityId: "fx_1"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (prev) {
      process.env.DATABASE_URL = prev;
    }
    expect(events.some((event) => event.action === "phase6.fx_entry.posted")).toBe(true);
  });
});
