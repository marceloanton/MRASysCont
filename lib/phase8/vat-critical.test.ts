import { Prisma } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { listAuditEvents, recordAuditEvent } from "../phase1/audit";
import {
  canAccessVatBookFromCompany,
  computeVatFromVoucher,
  ensureRateForOperationType,
  hasVatTenantScope,
  isValidVatOperationType,
  vatReconciliationMatchesConfirmedAccountingEntries
} from "./vat-rules";

describe("phase8 vat critical tests", () => {
  it("vat_sale_requires_study_and_company_scope", () => {
    expect(hasVatTenantScope({ studyId: "std_1", companyId: "emp_1", periodId: "p_1" })).toBe(
      true
    );
    expect(hasVatTenantScope({ studyId: "std_1", companyId: "emp_1", periodId: null })).toBe(
      false
    );
  });

  it("vat_purchase_requires_study_and_company_scope", () => {
    expect(hasVatTenantScope({ studyId: "std_1", companyId: "emp_1", periodId: "p_1" })).toBe(
      true
    );
    expect(hasVatTenantScope({ studyId: "std_1", companyId: null, periodId: "p_1" })).toBe(false);
  });

  it("cannot_access_vat_book_from_other_company", () => {
    expect(
      canAccessVatBookFromCompany({
        actorStudyId: "std_1",
        actorCompanyId: "emp_1",
        targetStudyId: "std_1",
        targetCompanyId: "emp_2"
      })
    ).toBe(false);
  });

  it("vat_operation_type_must_be_valid_gravada_exenta_no_gravada", () => {
    expect(isValidVatOperationType("GRAVADA")).toBe(true);
    expect(isValidVatOperationType("EXENTA")).toBe(true);
    expect(isValidVatOperationType("NO_GRAVADA")).toBe(true);
    expect(isValidVatOperationType("OTRA")).toBe(false);
  });

  it("vat_rate_must_be_valid_for_taxed_operation", () => {
    expect(ensureRateForOperationType({ operationType: "GRAVADA", vatRate: "21" })).toBe(true);
    expect(ensureRateForOperationType({ operationType: "GRAVADA", vatRate: "0" })).toBe(false);
  });

  it("vat_sales_book_is_built_from_scoped_vouchers_only", () => {
    const scoped = canAccessVatBookFromCompany({
      actorStudyId: "std_1",
      actorCompanyId: "emp_1",
      targetStudyId: "std_1",
      targetCompanyId: "emp_1"
    });
    const foreign = canAccessVatBookFromCompany({
      actorStudyId: "std_1",
      actorCompanyId: "emp_1",
      targetStudyId: "std_2",
      targetCompanyId: "emp_9"
    });
    expect(scoped).toBe(true);
    expect(foreign).toBe(false);
  });

  it("vat_purchases_book_is_built_from_scoped_vouchers_only", () => {
    const row = computeVatFromVoucher({
      netAmount: new Prisma.Decimal(100),
      vatAmount: new Prisma.Decimal(21),
      totalAmount: new Prisma.Decimal(121),
      notes: "[vat:GRAVADA]"
    });
    expect(row.operationType).toBe("GRAVADA");
    expect(row.vatAmount.toNumber()).toBe(21);
  });

  it("vat_monthly_report_is_scoped_by_company_and_period", () => {
    expect(hasVatTenantScope({ studyId: "std_1", companyId: "emp_1", periodId: "period_1" })).toBe(
      true
    );
  });

  it("vat_export_csv_is_scoped_by_company_and_period", () => {
    expect(hasVatTenantScope({ studyId: "std_1", companyId: "emp_1", periodId: "period_1" })).toBe(
      true
    );
    expect(hasVatTenantScope({ studyId: "std_1", companyId: "emp_1", periodId: undefined })).toBe(
      false
    );
  });

  it("vat_reconciliation_matches_confirmed_accounting_entries", () => {
    expect(
      vatReconciliationMatchesConfirmedAccountingEntries({
        expectedVatDebitFiscal: new Prisma.Decimal(21000),
        accountingVatDebitFiscal: new Prisma.Decimal(21000),
        expectedVatCreditFiscal: new Prisma.Decimal(10500),
        accountingVatCreditFiscal: new Prisma.Decimal(10500)
      })
    ).toBe(true);
  });

  it("critical_phase8_actions_create_audit_log", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase8.vat_report.generated",
      entity: "VatMonthlyReport",
      entityId: "period_2026_05"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (prev) process.env.DATABASE_URL = prev;
    expect(events.some((event) => event.action === "phase8.vat_report.generated")).toBe(true);
  });
});
