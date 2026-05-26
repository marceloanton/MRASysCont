import "server-only";

import { prisma } from "@/lib/prisma";
import { demoSettlements } from "./demo-data";
import type {
  SettlementDirection,
  SettlementResult,
  SettlementSummary
} from "./types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function listSettlements(studyId: string, companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      settlements: demoSettlements.filter(
        (settlement) => settlement.companyId === companyId
      )
    };
  }

  try {
    const settlements = await prisma.settlement.findMany({
      where: {
        studyId,
        companyId
      },
      include: {
        thirdParty: true,
        treasuryAccount: true
      },
      orderBy: {
        date: "desc"
      }
    });

    return {
      source: "database" as const,
      settlements: settlements.map((settlement): SettlementSummary => ({
        id: settlement.id,
        studyId: settlement.studyId ?? studyId,
        companyId: settlement.companyId,
        thirdPartyId: settlement.thirdPartyId,
        thirdPartyName: settlement.thirdParty.legalName,
        treasuryAccountId: settlement.treasuryAccountId ?? undefined,
        treasuryAccountName: settlement.treasuryAccount?.name ?? undefined,
        treasuryMovementId: settlement.treasuryMovementId ?? undefined,
        direction: settlement.direction as SettlementDirection,
        date: normalizeDate(settlement.date),
        currency: settlement.currency,
        amount: Number(settlement.amount),
        method: settlement.method,
        reference: settlement.reference ?? undefined,
        notes: settlement.notes ?? undefined
      }))
    };
  } catch {
    return {
      source: "demo" as const,
      settlements: demoSettlements.filter(
        (settlement) => settlement.companyId === companyId
      )
    };
  }
}

export async function createSettlement(input: {
  studyId: string;
  companyId: string;
  thirdPartyId: string;
  direction: SettlementDirection;
  date: Date;
  currency: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  treasuryAccountId?: string;
}): Promise<SettlementResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para registrar cobros/pagos hace falta PostgreSQL configurado."
    };
  }

  try {
    if (!input.studyId || !input.companyId || !input.thirdPartyId) {
      return {
        ok: false,
        message: "El movimiento requiere studyId, companyId y thirdPartyId."
      };
    }

    const company = await prisma.company.findFirst({
      where: {
        id: input.companyId,
        studyId: input.studyId
      },
      select: {
        id: true
      }
    });
    if (!company) {
      return {
        ok: false,
        message: "La empresa activa no pertenece al estudio activo."
      };
    }

    const thirdParty = await prisma.thirdParty.findFirst({
      where: {
        id: input.thirdPartyId,
        studyId: input.studyId,
        companyId: input.companyId,
        active: true
      }
    });

    if (!thirdParty) {
      return {
        ok: false,
        message: "El tercero debe existir, estar activo y pertenecer a la empresa activa."
      };
    }

    if (input.treasuryAccountId) {
      const treasuryAccount = await prisma.treasuryAccount.findFirst({
        where: {
          id: input.treasuryAccountId,
          studyId: input.studyId,
          companyId: input.companyId,
          active: true
        }
      });

      if (!treasuryAccount) {
        return {
          ok: false,
          message: "La cuenta de tesoreria debe existir, estar activa y pertenecer a la empresa activa."
        };
      }

      const settlement = await prisma.$transaction(async (tx) => {
        const movement = await tx.treasuryMovement.create({
          data: {
            companyId: input.companyId,
            studyId: input.studyId,
            treasuryAccountId: treasuryAccount.id,
            type: input.direction === "COBRO" ? "INGRESO" : "EGRESO",
            date: input.date,
            currency: input.currency,
            amount: input.amount,
            description: `${input.direction === "COBRO" ? "Cobro" : "Pago"} - ${thirdParty.legalName}`,
            reference: input.reference || null
          }
        });

        return tx.settlement.create({
          data: {
            companyId: input.companyId,
            studyId: input.studyId,
            thirdPartyId: input.thirdPartyId,
            treasuryAccountId: treasuryAccount.id,
            treasuryMovementId: movement.id,
            direction: input.direction,
            date: input.date,
            currency: input.currency,
            amount: input.amount,
            method: input.method,
            reference: input.reference || null,
            notes: input.notes || null
          }
        });
      });

      return {
        ok: true,
        message: input.direction === "COBRO" ? "Cobro registrado." : "Pago registrado.",
        id: settlement.id
      };
    }

    const settlement = await prisma.settlement.create({
      data: {
        companyId: input.companyId,
        studyId: input.studyId,
        thirdPartyId: input.thirdPartyId,
        direction: input.direction,
        date: input.date,
        currency: input.currency,
        amount: input.amount,
        method: input.method,
        reference: input.reference || null,
        notes: input.notes || null
      }
    });

    return {
      ok: true,
      message: input.direction === "COBRO" ? "Cobro registrado." : "Pago registrado.",
      id: settlement.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo registrar el movimiento. Revisar conexion."
    };
  }
}
