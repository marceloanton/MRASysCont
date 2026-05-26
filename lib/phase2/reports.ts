import "server-only";

import { prisma } from "@/lib/prisma";
import { demoJournalReportLines } from "./report-demo-data";
import type {
  AccountType,
  JournalReportLine,
  LedgerAccountReport,
  TrialBalanceLine
} from "./types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildLedger(lines: JournalReportLine[]): LedgerAccountReport[] {
  const groups = new Map<string, LedgerAccountReport>();

  for (const line of lines) {
    const key = line.accountId;
    const current = groups.get(key) ?? {
      accountId: key,
      accountCode: line.accountCode,
      accountName: line.accountName,
      totalDebit: 0,
      totalCredit: 0,
      balance: 0,
      lines: []
    };

    current.totalDebit += line.debit;
    current.totalCredit += line.credit;
    current.balance = current.totalDebit - current.totalCredit;
    current.lines.push(line);
    groups.set(key, current);
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode)
  );
}

function buildTrialBalance(lines: JournalReportLine[]): TrialBalanceLine[] {
  const groups = new Map<string, TrialBalanceLine>();

  for (const line of lines) {
    const current = groups.get(line.accountId) ?? {
      accountId: line.accountId,
      accountCode: line.accountCode,
      accountName: line.accountName,
      accountType: line.accountType,
      totalDebit: 0,
      totalCredit: 0,
      debitBalance: 0,
      creditBalance: 0
    };

    current.totalDebit += line.debit;
    current.totalCredit += line.credit;

    const balance = current.totalDebit - current.totalCredit;
    current.debitBalance = balance > 0 ? balance : 0;
    current.creditBalance = balance < 0 ? Math.abs(balance) : 0;
    groups.set(line.accountId, current);
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode)
  );
}

export async function getJournalReport(input: {
  studyId: string;
  companyId: string;
  periodId?: string;
}) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      lines: demoJournalReportLines
    };
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        studyId: input.studyId,
        companyId: input.companyId,
        status: "CONFIRMADO",
        ...(input.periodId ? { periodId: input.periodId } : {})
      },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      },
      orderBy: [
        {
          date: "asc"
        },
        {
          number: "asc"
        }
      ]
    });

    const lines = entries.flatMap((entry): JournalReportLine[] =>
      entry.lines.map((line) => ({
        entryId: entry.id,
        number: entry.number,
        date: normalizeDate(entry.date),
        description: entry.description,
        accountId: line.account.id,
        accountCode: line.account.code,
        accountName: line.account.name,
        accountType: line.account.type as AccountType,
        debit: Number(line.debit),
        credit: Number(line.credit),
        currency: line.currency,
        originalAmount: line.originalAmount ? Number(line.originalAmount) : undefined,
        exchangeRate: line.exchangeRate ? Number(line.exchangeRate) : undefined
      }))
    );

    return {
      source: "database" as const,
      lines
    };
  } catch {
    return {
      source: "demo" as const,
      lines: demoJournalReportLines
    };
  }
}

export async function getLedgerReport(input: {
  studyId: string;
  companyId: string;
  periodId?: string;
}) {
  const journal = await getJournalReport(input);

  return {
    source: journal.source,
    accounts: buildLedger(journal.lines)
  };
}

export async function getTrialBalanceReport(input: {
  studyId: string;
  companyId: string;
  periodId?: string;
}) {
  const journal = await getJournalReport(input);

  return {
    source: journal.source,
    lines: buildTrialBalance(journal.lines)
  };
}

export async function getAccountingReports(input: {
  studyId: string;
  companyId: string;
  periodId?: string;
}) {
  const journal = await getJournalReport(input);

  return {
    source: journal.source,
    journalLines: journal.lines,
    ledgerAccounts: buildLedger(journal.lines),
    trialBalanceLines: buildTrialBalance(journal.lines)
  };
}
