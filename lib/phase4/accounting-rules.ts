import type { JournalEntryLineInput, JournalEntryStatus } from "../phase2/types";
import { sumJournalLines, validateBalancedEntry } from "../phase2/validation";

type ScopedRecord = {
  studyId?: string | null;
  companyId?: string | null;
};

export function hasStudyAndCompanyScope(record: ScopedRecord) {
  return Boolean(record.studyId && record.companyId);
}

export function canAccessJournalEntryFromCompany(input: {
  actorStudyId: string;
  actorCompanyId: string;
  entryStudyId?: string | null;
  entryCompanyId: string;
}) {
  return (
    input.actorStudyId === input.entryStudyId &&
    input.actorCompanyId === input.entryCompanyId
  );
}

export function canConfirmEntry(input: {
  status: JournalEntryStatus;
  periodStatus: "ABIERTO" | "CERRADO";
  lines: JournalEntryLineInput[];
}) {
  if (input.status !== "BORRADOR") {
    return false;
  }

  if (input.periodStatus !== "ABIERTO") {
    return false;
  }

  return validateBalancedEntry(input.lines);
}

export function canModifyEntry(status: JournalEntryStatus) {
  return status === "BORRADOR";
}

export function totalsMatch(lines: JournalEntryLineInput[]) {
  const totals = sumJournalLines(lines);
  return totals.debit > 0 && totals.debit === totals.credit;
}

type EntryForBook = {
  id: string;
  status: JournalEntryStatus;
  lines: Array<{
    accountId: string;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
  }>;
};

export function buildJournalBookFromConfirmedEntries(entries: EntryForBook[]) {
  return entries
    .filter((entry) => entry.status === "CONFIRMADO")
    .flatMap((entry) =>
      entry.lines.map((line) => ({
        entryId: entry.id,
        ...line
      }))
    );
}

export function buildLedgerFromConfirmedEntries(entries: EntryForBook[]) {
  const lines = buildJournalBookFromConfirmedEntries(entries);
  const ledger = new Map<
    string,
    { accountId: string; accountCode: string; accountName: string; debit: number; credit: number }
  >();

  for (const line of lines) {
    const current = ledger.get(line.accountId) ?? {
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountName: line.accountName,
      debit: 0,
      credit: 0
    };

    current.debit += line.debit;
    current.credit += line.credit;
    ledger.set(line.accountId, current);
  }

  return Array.from(ledger.values());
}
