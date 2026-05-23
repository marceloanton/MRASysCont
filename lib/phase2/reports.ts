import "server-only";

import { prisma } from "@/lib/prisma";
import { demoJournalReportLines } from "./report-demo-data";
import type { JournalReportLine, LedgerAccountReport } from "./types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildLedger(lines: JournalReportLine[]): LedgerAccountReport[] {
  const groups = new Map<string, LedgerAccountReport>();

  for (const line of lines) {
    const key = `${line.accountCode}:${line.accountName}`;
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

export async function getJournalReport(input: {
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
        companyId: input.companyId,
        status: {
          in: ["CONFIRMADO", "ANULADO"]
        },
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
        accountCode: line.account.code,
        accountName: line.account.name,
        debit: Number(line.debit),
        credit: Number(line.credit)
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
  companyId: string;
  periodId?: string;
}) {
  const journal = await getJournalReport(input);

  return {
    source: journal.source,
    accounts: buildLedger(journal.lines)
  };
}
