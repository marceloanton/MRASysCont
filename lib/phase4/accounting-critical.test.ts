import { describe, expect, it } from "vitest";
import { listAuditEvents, recordAuditEvent } from "../phase1/audit";
import {
  buildJournalBookFromConfirmedEntries,
  buildLedgerFromConfirmedEntries,
  canAccessJournalEntryFromCompany,
  canConfirmEntry,
  canModifyEntry,
  hasStudyAndCompanyScope,
  totalsMatch
} from "./accounting-rules";

describe("phase4 accounting critical tests", () => {
  it("cannot_confirm_unbalanced_entry", () => {
    expect(
      canConfirmEntry({
        status: "BORRADOR",
        periodStatus: "ABIERTO",
        lines: [
          { accountId: "a1", debit: 100, credit: 0 },
          { accountId: "a2", debit: 0, credit: 50 }
        ]
      })
    ).toBe(false);
  });

  it("cannot_modify_confirmed_entry", () => {
    expect(canModifyEntry("CONFIRMADO")).toBe(false);
  });

  it("cannot_operate_in_closed_period", () => {
    expect(
      canConfirmEntry({
        status: "BORRADOR",
        periodStatus: "CERRADO",
        lines: [
          { accountId: "a1", debit: 100, credit: 0 },
          { accountId: "a2", debit: 0, credit: 100 }
        ]
      })
    ).toBe(false);
  });

  it("journal_entry_requires_study_and_company_scope", () => {
    expect(hasStudyAndCompanyScope({ studyId: "std_1", companyId: "emp_1" })).toBe(true);
    expect(hasStudyAndCompanyScope({ studyId: "std_1", companyId: null })).toBe(false);
  });

  it("cannot_access_journal_entry_from_other_company", () => {
    expect(
      canAccessJournalEntryFromCompany({
        actorStudyId: "std_1",
        actorCompanyId: "emp_1",
        entryStudyId: "std_1",
        entryCompanyId: "emp_2"
      })
    ).toBe(false);
  });

  it("double_entry_totals_must_match", () => {
    expect(
      totalsMatch([
        { accountId: "a1", debit: 250, credit: 0 },
        { accountId: "a2", debit: 0, credit: 250 }
      ])
    ).toBe(true);
  });

  it("journal_book_is_built_from_confirmed_entries_only", () => {
    const rows = buildJournalBookFromConfirmedEntries([
      {
        id: "e1",
        status: "CONFIRMADO",
        lines: [{ accountId: "a1", accountCode: "1.01.001", accountName: "Caja", debit: 100, credit: 0 }]
      },
      {
        id: "e2",
        status: "BORRADOR",
        lines: [{ accountId: "a2", accountCode: "4.01.001", accountName: "Ventas", debit: 0, credit: 100 }]
      }
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.entryId).toBe("e1");
  });

  it("ledger_is_built_from_confirmed_entries_only", () => {
    const rows = buildLedgerFromConfirmedEntries([
      {
        id: "e1",
        status: "CONFIRMADO",
        lines: [{ accountId: "a1", accountCode: "1.01.001", accountName: "Caja", debit: 100, credit: 0 }]
      },
      {
        id: "e2",
        status: "ANULADO",
        lines: [{ accountId: "a1", accountCode: "1.01.001", accountName: "Caja", debit: 0, credit: 100 }]
      }
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.debit).toBe(100);
    expect(rows[0]?.credit).toBe(0);
  });

  it("critical_phase4_actions_create_audit_log", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase4.journal_entry.confirmed",
      entity: "JournalEntry",
      entityId: "entry_1"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (prev) {
      process.env.DATABASE_URL = prev;
    }

    expect(events.some((event) => event.action === "phase4.journal_entry.confirmed")).toBe(true);
  });
});
