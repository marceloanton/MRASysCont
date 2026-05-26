import "server-only";

import { prisma } from "@/lib/prisma";
import { demoThirdParties } from "./demo-data";
import type { ThirdPartyResult, ThirdPartySummary, ThirdPartyType } from "./types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function listThirdParties(studyId: string, companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      thirdParties: demoThirdParties.filter(
        (thirdParty) => thirdParty.companyId === companyId
      )
    };
  }

  try {
    const thirdParties = await prisma.thirdParty.findMany({
      where: {
        studyId,
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
        studyId: thirdParty.studyId ?? studyId,
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
      thirdParties: demoThirdParties.filter(
        (thirdParty) => thirdParty.companyId === companyId
      )
    };
  }
}

export async function createThirdParty(input: {
  studyId: string;
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
    if (!input.studyId || !input.companyId) {
      return {
        ok: false,
        message: "El tercero requiere studyId y companyId."
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

    const thirdParty = await prisma.thirdParty.create({
      data: {
        studyId: input.studyId,
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

export async function updateThirdParty(input: {
  studyId: string;
  companyId: string;
  thirdPartyId: string;
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
      message: "Para editar terceros hace falta PostgreSQL configurado."
    };
  }

  try {
    if (!input.studyId || !input.companyId) {
      return {
        ok: false,
        message: "El tercero requiere studyId y companyId."
      };
    }

    const existing = await prisma.thirdParty.findFirst({
      where: {
        id: input.thirdPartyId,
        studyId: input.studyId,
        companyId: input.companyId
      }
    });

    if (!existing) {
      return {
        ok: false,
        message: "El tercero no existe para la empresa activa."
      };
    }

    const thirdParty = await prisma.thirdParty.update({
      where: {
        id: existing.id
      },
      data: {
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
      message: "Tercero actualizado.",
      id: thirdParty.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo editar el tercero. Revisar documento duplicado o conexion."
    };
  }
}

export async function setThirdPartyActive(input: {
  studyId: string;
  companyId: string;
  thirdPartyId: string;
  active: boolean;
}): Promise<ThirdPartyResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para cambiar estado hace falta PostgreSQL configurado."
    };
  }

  try {
    if (!input.studyId || !input.companyId) {
      return {
        ok: false,
        message: "El tercero requiere studyId y companyId."
      };
    }

    const existing = await prisma.thirdParty.findFirst({
      where: {
        id: input.thirdPartyId,
        studyId: input.studyId,
        companyId: input.companyId
      }
    });

    if (!existing) {
      return {
        ok: false,
        message: "El tercero no existe para la empresa activa."
      };
    }

    const thirdParty = await prisma.thirdParty.update({
      where: {
        id: existing.id
      },
      data: {
        active: input.active
      }
    });

    return {
      ok: true,
      message: input.active ? "Tercero activado." : "Tercero desactivado.",
      id: thirdParty.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo cambiar el estado del tercero."
    };
  }
}
