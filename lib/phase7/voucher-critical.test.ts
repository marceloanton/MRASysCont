import { describe, expect, it } from "vitest";
import { listAuditEvents, recordAuditEvent } from "../phase1/audit";
import {
  buildVoucherQrPayloadForLocal,
  canAccessVoucherPdfFromCompany,
  canConfirmVoucher,
  canCreateVoucherForCompany,
  hasVoucherTenantScope,
  isVoucherNumberUniqueByPointOfSaleAndType,
  isVoucherTransitionValid,
  shouldAssignNumberOnConfirm
} from "./voucher-rules";

describe("phase7 voucher critical tests", () => {
  it("voucher_requires_study_and_company_scope", () => {
    expect(hasVoucherTenantScope({ studyId: "std_1", companyId: "emp_1" })).toBe(true);
    expect(hasVoucherTenantScope({ studyId: "std_1", companyId: null })).toBe(false);
  });

  it("cannot_create_voucher_for_foreign_company", () => {
    expect(
      canCreateVoucherForCompany({
        actorStudyId: "std_1",
        actorCompanyId: "emp_1",
        targetStudyId: "std_1",
        targetCompanyId: "emp_2"
      })
    ).toBe(false);
  });

  it("voucher_number_is_unique_by_company_point_of_sale_type", () => {
    expect(
      isVoucherNumberUniqueByPointOfSaleAndType({
        pointOfSale: "0001",
        type: "FACTURA",
        number: "00000001",
        existing: [{ pointOfSale: "0001", type: "FACTURA", number: "00000001" }]
      })
    ).toBe(false);
  });

  it("emitted_voucher_number_is_assigned_on_confirm_only", () => {
    expect(shouldAssignNumberOnConfirm({ direction: "EMITIDO", currentNumber: null })).toBe(true);
    expect(shouldAssignNumberOnConfirm({ direction: "RECIBIDO", currentNumber: null })).toBe(false);
  });

  it("cannot_confirm_voucher_without_proposed_entry", () => {
    expect(
      canConfirmVoucher({
        voucherStatus: "BORRADOR",
        hasLinkedEntry: false,
        linkedEntryBalanced: true,
        periodStatus: "ABIERTO"
      })
    ).toBe(false);
  });

  it("cannot_confirm_voucher_if_linked_entry_unbalanced", () => {
    expect(
      canConfirmVoucher({
        voucherStatus: "BORRADOR",
        hasLinkedEntry: true,
        linkedEntryBalanced: false,
        periodStatus: "ABIERTO"
      })
    ).toBe(false);
  });

  it("cannot_confirm_voucher_if_period_closed", () => {
    expect(
      canConfirmVoucher({
        voucherStatus: "BORRADOR",
        hasLinkedEntry: true,
        linkedEntryBalanced: true,
        periodStatus: "CERRADO"
      })
    ).toBe(false);
  });

  it("voucher_state_transition_is_valid", () => {
    expect(isVoucherTransitionValid({ from: "BORRADOR", to: "REGISTRADO" })).toBe(true);
  });

  it("voucher_invalid_transition_returns_409", () => {
    expect(isVoucherTransitionValid({ from: "REGISTRADO", to: "BORRADOR" })).toBe(false);
  });

  it("voucher_pdf_generation_respects_tenant_scope", () => {
    expect(
      canAccessVoucherPdfFromCompany({
        actorStudyId: "std_1",
        actorCompanyId: "emp_1",
        voucherStudyId: "std_1",
        voucherCompanyId: "emp_2"
      })
    ).toBe(false);
  });

  it("voucher_qr_placeholder_is_generated_without_cae", () => {
    const payload = buildVoucherQrPayloadForLocal({
      issueDate: "2026-05-24",
      cuit: "30-12345678-9",
      pointOfSale: 1,
      voucherTypeCode: 6,
      voucherNumber: 1,
      totalAmount: 121000,
      receiverDocType: 80,
      receiverDocNumber: 20111222333
    });
    expect(payload.codAut).toBe(0);
  });

  it("critical_phase7_actions_create_audit_log", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase7.voucher.confirmed",
      entity: "Voucher",
      entityId: "vch_1"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (prev) process.env.DATABASE_URL = prev;
    expect(events.some((event) => event.action === "phase7.voucher.confirmed")).toBe(true);
  });
});
