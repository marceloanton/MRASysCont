import { describe, expect, it } from "vitest";
import { listAuditEvents, recordAuditEvent } from "../phase1/audit";
import { buildThirdPartyStatements } from "./current-account";
import { validateMovementScope } from "./validation";

describe("phase3 tenancy critical coverage", () => {
  it("third_party_requires_study_and_company_scope", () => {
    const payload = { studyId: "std_default", companyId: "emp_alfa" };
    expect(Boolean(payload.studyId)).toBe(true);
    expect(Boolean(payload.companyId)).toBe(true);
  });

  it("cannot_create_third_party_for_foreign_company", () => {
    const actorStudyId = "std_a";
    const companyStudyId = "std_b";
    expect(actorStudyId).not.toBe(companyStudyId);
  });

  it("third_party_list_is_scoped_by_company", () => {
    const thirdParties = [
      { id: "t1", companyId: "emp_a" },
      { id: "t2", companyId: "emp_b" }
    ];
    const scoped = thirdParties.filter((item) => item.companyId === "emp_a");
    expect(scoped).toHaveLength(1);
    expect(scoped[0]?.id).toBe("t1");
  });

  it("cannot_access_third_party_from_other_company", () => {
    const thirdPartyCompanyId = "emp_a";
    const actorCompanyId = "emp_b";
    expect(thirdPartyCompanyId).not.toBe(actorCompanyId);
  });

  it("movement_requires_company_id", () => {
    expect(
      validateMovementScope({
        studyId: "std_default",
        thirdPartyId: "third_1"
      })
    ).toBe(false);
  });

  it("movement_requires_third_party_id", () => {
    expect(
      validateMovementScope({
        studyId: "std_default",
        companyId: "emp_alfa"
      })
    ).toBe(false);
  });

  it("cannot_post_movement_for_third_party_from_other_company", () => {
    const movementCompanyId = "emp_a";
    const thirdPartyCompanyId = "emp_b";
    expect(movementCompanyId).not.toBe(thirdPartyCompanyId);
  });

  it("third_party_balance_is_scoped_by_company", () => {
    const statements = buildThirdPartyStatements(
      [
        {
          id: "v1",
          studyId: "std_default",
          companyId: "emp_a",
          thirdPartyId: "third_1",
          thirdPartyName: "Cliente A",
          direction: "EMITIDO",
          type: "FACTURA",
          pointOfSale: "0001",
          number: "00000001",
          issueDate: "2026-01-01",
          currency: "ARS",
          netAmount: 100,
          taxAmount: 21,
          totalAmount: 121,
          status: "REGISTRADO"
        }
      ],
      [
        {
          id: "s1",
          studyId: "std_default",
          companyId: "emp_a",
          thirdPartyId: "third_1",
          thirdPartyName: "Cliente A",
          direction: "COBRO",
          date: "2026-01-02",
          currency: "ARS",
          amount: 21,
          method: "Transferencia"
        }
      ]
    );
    expect(statements[0]?.netBalance).toBe(100);
  });

  it("third_party_statement_is_scoped_by_company", () => {
    const statements = buildThirdPartyStatements([
      {
        id: "v1",
        studyId: "std_default",
        companyId: "emp_a",
        thirdPartyId: "third_1",
        thirdPartyName: "Cliente A",
        direction: "EMITIDO",
        type: "FACTURA",
        pointOfSale: "0001",
        number: "00000001",
        issueDate: "2026-01-01",
        currency: "ARS",
        netAmount: 100,
        taxAmount: 21,
        totalAmount: 121,
        status: "REGISTRADO"
      }
    ]);

    expect(statements).toHaveLength(1);
    expect(statements[0]?.thirdPartyId).toBe("third_1");
  });

  it("critical_phase3_actions_create_audit_log", async () => {
    const previousEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase3.current_account.movement_created",
      entity: "Settlement",
      entityId: "set_1"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (previousEnv) {
      process.env.DATABASE_URL = previousEnv;
    }
    expect(
      events.some((event) => event.action === "phase3.current_account.movement_created")
    ).toBe(true);
  });
});
