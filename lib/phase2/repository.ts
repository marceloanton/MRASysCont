import "server-only";

import { prisma } from "@/lib/prisma";
import { demoAccounts, demoJournalEntries, demoPeriods } from "./demo-data";
import { accountChartTemplates, getAccountChartTemplate } from "./chart-templates";
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

function formatVoucherSerial(value: number) {
  return String(value).padStart(8, "0");
}

export async function listAccounts(studyId: string, companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      accounts: demoAccounts.filter(
        (account) => account.studyId === studyId && account.companyId === companyId
      )
    };
  }

  try {
    const accounts = await prisma.account.findMany({
        where: {
          studyId,
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
        studyId: account.studyId ?? undefined,
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
      accounts: demoAccounts.filter(
        (account) => account.studyId === studyId && account.companyId === companyId
      )
    };
  }
}

export async function createAccount(input: {
  studyId: string;
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
        studyId: input.studyId,
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

export async function listAccountChartTemplates() {
  return accountChartTemplates;
}

export async function applyAccountChartTemplate(input: {
  studyId: string;
  companyId: string;
  templateId: string;
}): Promise<AccountingResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para aplicar plantillas hace falta PostgreSQL configurado."
    };
  }

  const template = getAccountChartTemplate(input.templateId);

  if (!template) {
    return {
      ok: false,
      message: "La plantilla de plan de cuentas no existe."
    };
  }

  try {
    const createdCount = await prisma.$transaction(async (tx) => {
      const result = await tx.account.createMany({
        data: template.lines.map((line) => ({
          studyId: input.studyId,
          companyId: input.companyId,
          code: line.code,
          name: line.name,
          type: line.type,
          imputable: line.imputable,
          active: true
        })),
        skipDuplicates: true
      });

      return result.count;
    });

    return {
      ok: true,
      message: `Plantilla aplicada. Cuentas creadas: ${createdCount}.`,
      id: input.templateId
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo aplicar la plantilla. Revisar conexion y datos."
    };
  }
}

export async function listAccountingPeriods(studyId: string, companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      periods: demoPeriods.filter(
        (period) => period.studyId === studyId && period.companyId === companyId
      )
    };
  }

  try {
    const periods = await prisma.accountingPeriod.findMany({
        where: {
          studyId,
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
        studyId: period.studyId ?? undefined,
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
      periods: demoPeriods.filter(
        (period) => period.studyId === studyId && period.companyId === companyId
      )
    };
  }
}

export async function createAccountingPeriod(input: {
  studyId: string;
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
        studyId: input.studyId,
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
  studyId: string;
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
        studyId: input.studyId,
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

export async function listJournalEntries(studyId: string, companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      entries: demoJournalEntries.filter(
        (entry) => entry.studyId === studyId && entry.companyId === companyId
      )
    };
  }

  try {
    const entries = await prisma.journalEntry.findMany({
        where: {
          studyId,
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
          studyId: entry.studyId ?? undefined,
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
      entries: demoJournalEntries.filter(
        (entry) => entry.studyId === studyId && entry.companyId === companyId
      )
    };
  }
}

export async function reverseJournalEntry(input: {
  studyId: string;
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
        studyId: input.studyId,
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
        ,
        studyId: input.studyId
      },
      orderBy: {
        number: "desc"
      }
    });

    const reversal = await prisma.$transaction(async (tx) => {
      const reversalEntry = await tx.journalEntry.create({
        data: {
          companyId: entry.companyId,
          studyId: entry.studyId,
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
  studyId: string;
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
        studyId: input.studyId,
        companyId: input.companyId
      },
      orderBy: {
        number: "desc"
      }
    });

    const entry = await prisma.journalEntry.create({
      data: {
        companyId: input.companyId,
        studyId: input.studyId,
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
  studyId: string;
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
        studyId: input.studyId,
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
  studyId: string;
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
        studyId: input.studyId,
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
  studyId: string;
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
        studyId: input.studyId,
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

    await prisma.$transaction(async (tx) => {
      // Confirmamos el asiento y sincronizamos el comprobante vinculado en una sola unidad atomica.
      await tx.journalEntry.update({
        where: {
          id: entry.id
        },
        data: {
          status: "CONFIRMADO"
        }
      });

      const linkedVoucher = await tx.voucher.findFirst({
        where: {
          studyId: input.studyId,
          companyId: input.companyId,
          journalEntryId: entry.id
        },
        select: {
          id: true,
          direction: true,
          type: true,
          pointOfSale: true,
          number: true
        }
      });

      if (!linkedVoucher) {
        return;
      }

      // Regla: la numeracion fiscal se asigna al confirmar.
      // Solo aplica a EMITIDO; RECIBIDO conserva el numero cargado.
      if (linkedVoucher.direction === "EMITIDO" && !linkedVoucher.number) {
        const nextSequence = await tx.$queryRaw<Array<{ lastNumber: number }>>`
          INSERT INTO "VoucherSequence" ("id", "companyId", "pointOfSale", "type", "lastNumber", "createdAt", "updatedAt")
          VALUES (md5(random()::text || clock_timestamp()::text), ${input.companyId}, ${linkedVoucher.pointOfSale}, ${linkedVoucher.type}::"VoucherType", 1, NOW(), NOW())
          ON CONFLICT ("companyId", "pointOfSale", "type")
          DO UPDATE SET "lastNumber" = "VoucherSequence"."lastNumber" + 1, "updatedAt" = NOW()
          RETURNING "lastNumber";
        `;

        await tx.voucher.update({
          where: {
            id: linkedVoucher.id
          },
          data: {
            number: formatVoucherSerial(nextSequence[0].lastNumber),
            status: "REGISTRADO"
          }
        });
      } else {
        await tx.voucher.update({
          where: {
            id: linkedVoucher.id
          },
          data: {
            status: "REGISTRADO"
          }
        });
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
