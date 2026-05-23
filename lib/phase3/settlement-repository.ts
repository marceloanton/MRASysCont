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

export async function listSettlements(companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      settlements: demoSettlements.filter((settlement) => settlement.companyId === companyId)
    };
  }

  try {
    const settlements = await prisma.settlement.findMany({
      where: {
        companyId
      },
      include: {
        thirdParty: true
      },
      orderBy: {
        date: "desc"
      }
    });

    return {
      source: "database" as const,
      settlements: settlements.map((settlement): SettlementSummary => ({
        id: settlement.id,
        companyId: settlement.companyId,
        thirdPartyId: settlement.thirdPartyId,
        thirdPartyName: settlement.thirdParty.legalName,
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
      settlements: demoSettlements.filter((settlement) => settlement.companyId === companyId)
    };
  }
}

export async function createSettlement(input: {
  companyId: string;
  thirdPartyId: string;
  direction: SettlementDirection;
  date: Date;
  currency: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
}): Promise<SettlementResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para registrar cobros/pagos hace falta PostgreSQL configurado."
    };
  }

  try {
    const thirdParty = await prisma.thirdParty.findFirst({
      where: {
        id: input.thirdPartyId,
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

    const settlement = await prisma.settlement.create({
      data: {
        companyId: input.companyId,
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
