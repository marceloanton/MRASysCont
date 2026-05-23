import "server-only";

import { prisma } from "@/lib/prisma";
import { demoThirdParties } from "./demo-data";
import type { ThirdPartyResult, ThirdPartySummary, ThirdPartyType } from "./types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listThirdParties(companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      thirdParties: demoThirdParties.filter((thirdParty) => thirdParty.companyId === companyId)
    };
  }

  try {
    const thirdParties = await prisma.thirdParty.findMany({
      where: {
        companyId
      },
      orderBy: [
        {
          active: "desc"
        },
        {
          legalName: "asc"
        }
      ]
    });

    return {
      source: "database" as const,
      thirdParties: thirdParties.map((thirdParty): ThirdPartySummary => ({
        id: thirdParty.id,
        companyId: thirdParty.companyId,
        type: thirdParty.type as ThirdPartyType,
        legalName: thirdParty.legalName,
        tradeName: thirdParty.tradeName ?? undefined,
        documentType: thirdParty.documentType,
        document: thirdParty.document,
        taxCondition: thirdParty.taxCondition,
        email: thirdParty.email ?? undefined,
        phone: thirdParty.phone ?? undefined,
        address: thirdParty.address ?? undefined,
        active: thirdParty.active
      }))
    };
  } catch {
    return {
      source: "demo" as const,
      thirdParties: demoThirdParties.filter((thirdParty) => thirdParty.companyId === companyId)
    };
  }
}

export async function createThirdParty(input: {
  companyId: string;
  type: ThirdPartyType;
  legalName: string;
  tradeName?: string;
  documentType: string;
  document: string;
  taxCondition: string;
  email?: string;
  phone?: string;
  address?: string;
}): Promise<ThirdPartyResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para crear terceros hace falta PostgreSQL configurado."
    };
  }

  try {
    const thirdParty = await prisma.thirdParty.create({
      data: {
        companyId: input.companyId,
        type: input.type,
        legalName: input.legalName,
        tradeName: input.tradeName || null,
        documentType: input.documentType,
        document: input.document,
        taxCondition: input.taxCondition,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null
      }
    });

    return {
      ok: true,
      message: "Tercero creado.",
      id: thirdParty.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear el tercero. Revisar documento duplicado o conexion."
    };
  }
}
