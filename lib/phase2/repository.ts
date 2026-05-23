import "server-only";

import { prisma } from "@/lib/prisma";
import { demoAccounts, demoPeriods } from "./demo-data";
import type {
  AccountingPeriodSummary,
  AccountingResult,
  AccountSummary,
  AccountType
} from "./types";

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
