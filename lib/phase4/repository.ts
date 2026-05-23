import "server-only";

import { prisma } from "@/lib/prisma";
import { demoTreasuryAccounts, demoTreasuryMovements } from "./demo-data";
import type {
  TreasuryAccountSummary,
  TreasuryAccountType,
  TreasuryMovementSummary,
  TreasuryMovementType,
  TreasuryResult
} from "./types";
import { signedTreasuryAmount } from "./validation";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildBalances(
  accounts: Omit<TreasuryAccountSummary, "balance">[],
  movements: TreasuryMovementSummary[]
): TreasuryAccountSummary[] {
  return accounts.map((account) => ({
    ...account,
    balance: movements
      .filter((movement) => movement.treasuryAccountId === account.id)
      .reduce((sum, movement) => sum + movement.signedAmount, 0)
  }));
}

export async function listTreasury(companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      accounts: demoTreasuryAccounts.filter((account) => account.companyId === companyId),
      movements: demoTreasuryMovements.filter((movement) => movement.companyId === companyId)
    };
  }

  try {
    const [accounts, movements] = await Promise.all([
      prisma.treasuryAccount.findMany({
        where: {
          companyId
        },
        orderBy: {
          name: "asc"
        }
      }),
      prisma.treasuryMovement.findMany({
        where: {
          companyId
        },
        include: {
          treasuryAccount: true
        },
        orderBy: {
          date: "desc"
        }
      })
    ]);
    const mappedMovements = movements.map((movement): TreasuryMovementSummary => ({
      id: movement.id,
      companyId: movement.companyId,
      treasuryAccountId: movement.treasuryAccountId,
      treasuryAccountName: movement.treasuryAccount.name,
      type: movement.type as TreasuryMovementType,
      date: normalizeDate(movement.date),
      currency: movement.currency,
      amount: Math.abs(Number(movement.amount)),
      signedAmount: signedTreasuryAmount(movement.type as TreasuryMovementType, Number(movement.amount)),
      description: movement.description,
      reference: movement.reference ?? undefined,
      reconciled: movement.reconciled,
      reconciledAt: movement.reconciledAt ? normalizeDate(movement.reconciledAt) : undefined,
      reconciliationReference: movement.reconciliationReference ?? undefined
    }));
    const mappedAccounts = accounts.map((account) => ({
      id: account.id,
      companyId: account.companyId,
      type: account.type as TreasuryAccountType,
      name: account.name,
      currency: account.currency,
      bankName: account.bankName ?? undefined,
      accountNumber: account.accountNumber ?? undefined,
      active: account.active
    }));

    return {
      source: "database" as const,
      accounts: buildBalances(mappedAccounts, mappedMovements),
      movements: mappedMovements
    };
  } catch {
    return {
      source: "demo" as const,
      accounts: demoTreasuryAccounts.filter((account) => account.companyId === companyId),
      movements: demoTreasuryMovements.filter((movement) => movement.companyId === companyId)
    };
  }
}

export async function setTreasuryMovementReconciliation(input: {
  companyId: string;
  movementId: string;
  reconciled: boolean;
  reconciledAt?: Date;
  reconciliationReference?: string;
}): Promise<TreasuryResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para conciliar movimientos hace falta PostgreSQL configurado."
    };
  }

  try {
    const movement = await prisma.treasuryMovement.findFirst({
      where: {
        id: input.movementId,
        companyId: input.companyId
      }
    });

    if (!movement) {
      return {
        ok: false,
        message: "El movimiento no existe o no pertenece a la empresa activa."
      };
    }

    await prisma.treasuryMovement.update({
      where: {
        id: movement.id
      },
      data: input.reconciled
        ? {
            reconciled: true,
            reconciledAt: input.reconciledAt ?? new Date(),
            reconciliationReference: input.reconciliationReference || null
          }
        : {
            reconciled: false,
            reconciledAt: null,
            reconciliationReference: null
          }
    });

    return {
      ok: true,
      message: input.reconciled
        ? "Movimiento conciliado."
        : "Conciliacion removida.",
      id: movement.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo actualizar la conciliacion. Revisar conexion."
    };
  }
}

export async function createTreasuryAccount(input: {
  companyId: string;
  type: TreasuryAccountType;
  name: string;
  currency: string;
  bankName?: string;
  accountNumber?: string;
}): Promise<TreasuryResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para crear cajas/bancos hace falta PostgreSQL configurado."
    };
  }

  try {
    const account = await prisma.treasuryAccount.create({
      data: {
        companyId: input.companyId,
        type: input.type,
        name: input.name,
        currency: input.currency,
        bankName: input.bankName || null,
        accountNumber: input.accountNumber || null
      }
    });

    return {
      ok: true,
      message: "Cuenta de tesoreria creada.",
      id: account.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear la cuenta. Revisar nombre duplicado o conexion."
    };
  }
}

export async function createTreasuryMovement(input: {
  companyId: string;
  treasuryAccountId: string;
  type: TreasuryMovementType;
  date: Date;
  currency: string;
  amount: number;
  description: string;
  reference?: string;
}): Promise<TreasuryResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para registrar movimientos hace falta PostgreSQL configurado."
    };
  }

  try {
    const account = await prisma.treasuryAccount.findFirst({
      where: {
        id: input.treasuryAccountId,
        companyId: input.companyId,
        active: true
      }
    });

    if (!account) {
      return {
        ok: false,
        message: "La cuenta debe existir, estar activa y pertenecer a la empresa activa."
      };
    }

    const movement = await prisma.treasuryMovement.create({
      data: {
        companyId: input.companyId,
        treasuryAccountId: input.treasuryAccountId,
        type: input.type,
        date: input.date,
        currency: input.currency,
        amount: input.amount,
        description: input.description,
        reference: input.reference || null
      }
    });

    return {
      ok: true,
      message: "Movimiento registrado.",
      id: movement.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo registrar el movimiento. Revisar conexion."
    };
  }
}
