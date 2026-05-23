import "server-only";

import { prisma } from "@/lib/prisma";
import { demoVouchers } from "./demo-data";
import type {
  VoucherDirection,
  VoucherResult,
  VoucherStatus,
  VoucherSummary,
  VoucherType
} from "./types";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function listVouchers(companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      vouchers: demoVouchers.filter((voucher) => voucher.companyId === companyId)
    };
  }

  try {
    const vouchers = await prisma.voucher.findMany({
      where: {
        companyId
      },
      include: {
        thirdParty: true
      },
      orderBy: [
        {
          issueDate: "desc"
        },
        {
          number: "desc"
        }
      ]
    });

    return {
      source: "database" as const,
      vouchers: vouchers.map((voucher): VoucherSummary => ({
        id: voucher.id,
        companyId: voucher.companyId,
        thirdPartyId: voucher.thirdPartyId,
        thirdPartyName: voucher.thirdParty.legalName,
        direction: voucher.direction as VoucherDirection,
        type: voucher.type as VoucherType,
        letter: voucher.letter ?? undefined,
        pointOfSale: voucher.pointOfSale,
        number: voucher.number,
        issueDate: normalizeDate(voucher.issueDate),
        dueDate: voucher.dueDate ? normalizeDate(voucher.dueDate) : undefined,
        currency: voucher.currency,
        netAmount: Number(voucher.netAmount),
        taxAmount: Number(voucher.taxAmount),
        totalAmount: Number(voucher.totalAmount),
        status: voucher.status as VoucherStatus,
        notes: voucher.notes ?? undefined
      }))
    };
  } catch {
    return {
      source: "demo" as const,
      vouchers: demoVouchers.filter((voucher) => voucher.companyId === companyId)
    };
  }
}

export async function createVoucher(input: {
  companyId: string;
  thirdPartyId: string;
  direction: VoucherDirection;
  type: VoucherType;
  letter?: string;
  pointOfSale: string;
  number: string;
  issueDate: Date;
  dueDate?: Date;
  currency: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
}): Promise<VoucherResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para crear comprobantes hace falta PostgreSQL configurado."
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

    const voucher = await prisma.voucher.create({
      data: {
        companyId: input.companyId,
        thirdPartyId: input.thirdPartyId,
        direction: input.direction,
        type: input.type,
        letter: input.letter || null,
        pointOfSale: input.pointOfSale,
        number: input.number,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        currency: input.currency,
        netAmount: input.netAmount,
        taxAmount: input.taxAmount,
        totalAmount: input.totalAmount,
        notes: input.notes || null,
        status: "REGISTRADO"
      }
    });

    return {
      ok: true,
      message: "Comprobante registrado.",
      id: voucher.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo registrar el comprobante. Revisar duplicados o conexion."
    };
  }
}
