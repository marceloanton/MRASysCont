import "server-only";

import { prisma } from "@/lib/prisma";
import { demoAccounts, demoJournalEntries, demoPeriods } from "./demo-data";
import type {
  AccountingPeriodSummary,
  AccountingResult,
  AccountSummary,
  AccountType,
  JournalEntryLineInput,
  JournalEntrySummary
} from "./types";
import { sumJournalLines } from "./validation";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function listAccounts(companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      accounts: demoAccounts.filter((account) => account.companyId === companyId)
    };
  }

  try {
    const accounts = await prisma.account.findMany({
      where: {
        companyId
      },
      orderBy: {
        code: "asc"
      }
    });

    return {
      source: "database" as const,
      accounts: accounts.map((account): AccountSummary => ({
        id: account.id,
        companyId: account.companyId,
        code: account.code,
        name: account.name,
        type: account.type as AccountType,
        imputable: account.imputable,
        active: account.active
      }))
    };
  } catch {
    return {
      source: "demo" as const,
      accounts: demoAccounts.filter((account) => account.companyId === companyId)
    };
  }
}

export async function createAccount(input: {
  companyId: string;
  code: string;
  name: string;
  type: AccountType;
  imputable: boolean;
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para crear cuentas hace falta PostgreSQL configurado."
    };
  }

  try {
    const account = await prisma.account.create({
      data: {
        companyId: input.companyId,
        code: input.code,
        name: input.name,
        type: input.type,
        imputable: input.imputable
      }
    });

    return {
      ok: true,
      message: "Cuenta creada.",
      id: account.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear la cuenta. Revisar codigo duplicado o conexion."
    };
  }
}

export async function listAccountingPeriods(companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      periods: demoPeriods.filter((period) => period.companyId === companyId)
    };
  }

  try {
    const periods = await prisma.accountingPeriod.findMany({
      where: {
        companyId
      },
      orderBy: {
        startsAt: "asc"
      }
    });

    return {
      source: "database" as const,
      periods: periods.map((period): AccountingPeriodSummary => ({
        id: period.id,
        companyId: period.companyId,
        name: period.name,
        startsAt: normalizeDate(period.startsAt),
        endsAt: normalizeDate(period.endsAt),
        status: period.status
      }))
    };
  } catch {
    return {
      source: "demo" as const,
      periods: demoPeriods.filter((period) => period.companyId === companyId)
    };
  }
}

export async function createAccountingPeriod(input: {
  companyId: string;
  name: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para crear periodos hace falta PostgreSQL configurado."
    };
  }

  try {
    const period = await prisma.accountingPeriod.create({
      data: {
        companyId: input.companyId,
        name: input.name,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: "ABIERTO"
      }
    });

    return {
      ok: true,
      message: "Periodo creado.",
      id: period.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear el periodo. Revisar fechas o conexion."
    };
  }
}

export async function closeAccountingPeriod(input: {
  companyId: string;
  periodId: string;
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para cerrar periodos hace falta PostgreSQL configurado."
    };
  }

  try {
    const period = await prisma.accountingPeriod.findFirst({
      where: {
        id: input.periodId,
        companyId: input.companyId
      }
    });

    if (!period) {
      return {
        ok: false,
        message: "El periodo no existe para la empresa activa."
      };
    }

    if (period.status === "CERRADO") {
      return {
        ok: false,
        message: "El periodo ya esta cerrado."
      };
    }

    await prisma.accountingPeriod.update({
      where: {
        id: period.id
      },
      data: {
        status: "CERRADO"
      }
    });

    return {
      ok: true,
      message: "Periodo cerrado.",
      id: period.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo cerrar el periodo. Revisar conexion."
    };
  }
}

export async function listJournalEntries(companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      entries: demoJournalEntries.filter((entry) => entry.companyId === companyId)
    };
  }

  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        companyId
      },
      include: {
        lines: {
          include: {
            account: true
          },
          orderBy: {
            id: "asc"
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    });

    return {
      source: "database" as const,
      entries: entries.map((entry): JournalEntrySummary => {
        const totals = sumJournalLines(
          entry.lines.map((line) => ({
            accountId: line.accountId,
            debit: Number(line.debit),
            credit: Number(line.credit)
          }))
        );

        return {
          id: entry.id,
          companyId: entry.companyId,
          periodId: entry.periodId,
          number: entry.number,
          date: normalizeDate(entry.date),
          description: entry.description,
          status: entry.status,
          reversalOfEntryId: entry.reversalOfEntryId ?? undefined,
          reversedByEntryId: entry.reversedByEntryId ?? undefined,
          reversalReason: entry.reversalReason ?? undefined,
          totalDebit: totals.debit,
          totalCredit: totals.credit,
          lines: entry.lines.map((line) => ({
            accountId: line.accountId,
            accountCode: line.account.code,
            accountName: line.account.name,
            debit: Number(line.debit),
            credit: Number(line.credit)
          }))
        };
      })
    };
  } catch {
    return {
      source: "demo" as const,
      entries: demoJournalEntries.filter((entry) => entry.companyId === companyId)
    };
  }
}

export async function reverseJournalEntry(input: {
  companyId: string;
  entryId: string;
  reason: string;
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para anular asientos hace falta PostgreSQL configurado."
    };
  }

  try {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: input.entryId,
        companyId: input.companyId
      },
      include: {
        lines: true,
        period: true
      }
    });

    if (!entry) {
      return {
        ok: false,
        message: "El asiento no existe para la empresa activa."
      };
    }

    if (entry.status !== "CONFIRMADO") {
      return {
        ok: false,
        message: "Solo se pueden anular asientos confirmados."
      };
    }

    if (entry.reversedByEntryId || entry.reversalOfEntryId) {
      return {
        ok: false,
        message: "Este asiento ya forma parte de una anulacion."
      };
    }

    if (entry.period.status !== "ABIERTO") {
      return {
        ok: false,
        message: "No se puede anular un asiento en periodo cerrado."
      };
    }

    const latest = await prisma.journalEntry.findFirst({
      where: {
        companyId: input.companyId
      },
      orderBy: {
        number: "desc"
      }
    });

    const reversal = await prisma.$transaction(async (tx) => {
      const reversalEntry = await tx.journalEntry.create({
        data: {
          companyId: entry.companyId,
          periodId: entry.periodId,
          number: (latest?.number ?? 0) + 1,
          date: new Date(),
          description: `Contraasiento por anulacion: ${entry.description}`,
          status: "CONFIRMADO",
          reversalOfEntryId: entry.id,
          reversalReason: input.reason,
          lines: {
            create: entry.lines.map((line) => ({
              accountId: line.accountId,
              debit: line.credit,
              credit: line.debit,
              currency: line.currency,
              originalAmount: line.originalAmount,
              exchangeRate: line.exchangeRate
            }))
          }
        }
      });

      await tx.journalEntry.update({
        where: {
          id: entry.id
        },
        data: {
          status: "ANULADO",
          reversedByEntryId: reversalEntry.id,
          reversalReason: input.reason
        }
      });

      return reversalEntry;
    });

    return {
      ok: true,
      message: "Asiento anulado con contraasiento.",
      id: reversal.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo anular el asiento. Revisar conexion."
    };
  }
}

export async function createJournalEntry(input: {
  companyId: string;
  periodId: string;
  date: Date;
  description: string;
  lines: JournalEntryLineInput[];
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para crear asientos hace falta PostgreSQL configurado."
    };
  }

  try {
    const latest = await prisma.journalEntry.findFirst({
      where: {
        companyId: input.companyId
      },
      orderBy: {
        number: "desc"
      }
    });

    const entry = await prisma.journalEntry.create({
      data: {
        companyId: input.companyId,
        periodId: input.periodId,
        number: (latest?.number ?? 0) + 1,
        date: input.date,
        description: input.description,
        status: "BORRADOR",
        lines: {
          create: input.lines.map((line) => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit
          }))
        }
      }
    });

    return {
      ok: true,
      message: "Asiento borrador creado.",
      id: entry.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear el asiento. Revisar periodo, cuentas o conexion."
    };
  }
}

export async function updateDraftJournalEntry(input: {
  companyId: string;
  entryId: string;
  date: Date;
  description: string;
  lines: JournalEntryLineInput[];
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para editar asientos hace falta PostgreSQL configurado."
    };
  }

  try {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: input.entryId,
        companyId: input.companyId
      },
      include: {
        period: true
      }
    });

    if (!entry) {
      return {
        ok: false,
        message: "El asiento no existe para la empresa activa."
      };
    }

    if (entry.status !== "BORRADOR") {
      return {
        ok: false,
        message: "Solo se pueden editar asientos en borrador."
      };
    }

    if (entry.period.status !== "ABIERTO") {
      return {
        ok: false,
        message: "No se puede editar un asiento de un periodo cerrado."
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.journalEntryLine.deleteMany({
        where: {
          journalEntryId: entry.id
        }
      });

      await tx.journalEntry.update({
        where: {
          id: entry.id
        },
        data: {
          date: input.date,
          description: input.description,
          lines: {
            create: input.lines.map((line) => ({
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit
            }))
          }
        }
      });
    });

    return {
      ok: true,
      message: "Asiento borrador actualizado.",
      id: entry.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo editar el asiento. Revisar cuentas o conexion."
    };
  }
}

export async function deleteDraftJournalEntry(input: {
  companyId: string;
  entryId: string;
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para eliminar borradores hace falta PostgreSQL configurado."
    };
  }

  try {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: input.entryId,
        companyId: input.companyId
      },
      include: {
        period: true
      }
    });

    if (!entry) {
      return {
        ok: false,
        message: "El asiento no existe para la empresa activa."
      };
    }

    if (entry.status !== "BORRADOR") {
      return {
        ok: false,
        message: "Solo se pueden eliminar asientos en borrador."
      };
    }

    if (entry.period.status !== "ABIERTO") {
      return {
        ok: false,
        message: "No se puede eliminar un borrador de un periodo cerrado."
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.journalEntryLine.deleteMany({
        where: {
          journalEntryId: entry.id
        }
      });

      await tx.journalEntry.delete({
        where: {
          id: entry.id
        }
      });
    });

    return {
      ok: true,
      message: "Asiento borrador eliminado.",
      id: entry.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo eliminar el borrador. Revisar conexion."
    };
  }
}

export async function confirmJournalEntry(input: {
  companyId: string;
  entryId: string;
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para confirmar asientos hace falta PostgreSQL configurado."
    };
  }

  try {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: input.entryId,
        companyId: input.companyId
      },
      include: {
        lines: true,
        period: true
      }
    });

    if (!entry) {
      return {
        ok: false,
        message: "El asiento no existe para la empresa activa."
      };
    }

    if (entry.status !== "BORRADOR") {
      return {
        ok: false,
        message: "Solo se pueden confirmar asientos en borrador."
      };
    }

    if (entry.period.status !== "ABIERTO") {
      return {
        ok: false,
        message: "No se puede confirmar un asiento en periodo cerrado."
      };
    }

    const totals = sumJournalLines(
      entry.lines.map((line) => ({
        accountId: line.accountId,
        debit: Number(line.debit),
        credit: Number(line.credit)
      }))
    );

    if (totals.debit <= 0 || totals.debit !== totals.credit) {
      return {
        ok: false,
        message: "El asiento no esta balanceado."
      };
    }

    await prisma.journalEntry.update({
      where: {
        id: entry.id
      },
      data: {
        status: "CONFIRMADO"
      }
    });

    return {
      ok: true,
      message: "Asiento confirmado.",
      id: entry.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo confirmar el asiento. Revisar conexion."
    };
  }
}
