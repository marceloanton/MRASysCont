import { prisma } from "@/lib/prisma";
import { buildArsAmounts, validateFxPosting } from "@/lib/phase6/fx-rules";
import { demoVouchers } from "./demo-data";
import {
  isConsumidorFinal,
  isMonotributista,
  isResponsableInscripto
} from "./validation";
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

function normalizeVoucherNumber(pointOfSale: string, number: string) {
  // Normalizamos la etiqueta visible para reusar en descripciones y auditoria.
  return `${pointOfSale}-${number}`;
}

export async function listVouchers(studyId: string, companyId: string) {
  if (!hasDatabase()) {
    return {
      source: "demo" as const,
      vouchers: demoVouchers.filter((voucher) => voucher.companyId === companyId)
    };
  }

  try {
    const vouchers = await prisma.voucher.findMany({
      where: {
        studyId,
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
        studyId: voucher.studyId ?? studyId,
        companyId: voucher.companyId,
        thirdPartyId: voucher.thirdPartyId,
        thirdPartyName: voucher.thirdParty.legalName,
        journalEntryId: voucher.journalEntryId ?? undefined,
        relatedVoucherId: voucher.relatedVoucherId ?? undefined,
        direction: voucher.direction as VoucherDirection,
        type: voucher.type as VoucherType,
        letter: voucher.letter ?? undefined,
        pointOfSale: voucher.pointOfSale,
        number: voucher.number ?? undefined,
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
  studyId: string;
  companyId: string;
  thirdPartyId: string;
  direction: VoucherDirection;
  type: VoucherType;
  letter?: string;
  pointOfSale: string;
  number: string;
  relatedVoucherId?: string;
  issueDate: Date;
  dueDate?: Date;
  currency: string;
  exchangeRate?: number;
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
    const fxValidation = validateFxPosting({
      currency: input.currency,
      netAmount: input.netAmount,
      taxAmount: input.taxAmount,
      totalAmount: input.totalAmount,
      exchangeRate: input.exchangeRate,
      studyId: input.studyId,
      companyId: input.companyId
    });
    if (!fxValidation.ok) {
      return {
        ok: false,
        message: fxValidation.message
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

    const company = await prisma.company.findFirst({
      where: {
        id: input.companyId,
        studyId: input.studyId
      }
    });

    if (!company) {
      return {
        ok: false,
        message: "La empresa activa no existe."
      };
    }

    // Reglas A/B/C por condicion fiscal de emisor y receptor.
    if (input.letter === "A") {
      if (!isResponsableInscripto(company.taxCondition)) {
        return {
          ok: false,
          message: "Factura A: el emisor debe ser Responsable Inscripto."
        };
      }
      if (
        !isResponsableInscripto(thirdParty.taxCondition) &&
        !isMonotributista(thirdParty.taxCondition)
      ) {
        return {
          ok: false,
          message: "Factura A: receptor debe ser Responsable Inscripto o Monotributista."
        };
      }
    }

    if (input.letter === "B") {
      if (
        !isConsumidorFinal(thirdParty.taxCondition) &&
        !isMonotributista(thirdParty.taxCondition)
      ) {
        return {
          ok: false,
          message: "Factura B: receptor debe ser Consumidor Final o Monotributista."
        };
      }

      // Tope operativo para consumidor final: si supera el umbral, exigir documento identificatorio.
      if (
        isConsumidorFinal(thirdParty.taxCondition) &&
        Math.round(input.totalAmount * 100) >= 100000000 &&
        thirdParty.document.trim().length < 7
      ) {
        return {
          ok: false,
          message:
            "Factura B a consumidor final >= $1.000.000 requiere datos completos del comprador."
        };
      }
    }

    if (input.letter === "C" && !isMonotributista(company.taxCondition)) {
      return {
        ok: false,
        message: "Factura C: solo puede emitirla un Monotributista."
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      if (input.type === "NOTA_CREDITO" || input.type === "NOTA_DEBITO") {
        if (!input.relatedVoucherId) {
          return {
            ok: false,
            message: "NC/ND requiere comprobante origen."
          } as VoucherResult;
        }

        // Validamos el origen antes de crear para mantener atomicidad sin efectos parciales.
        const origin = await tx.voucher.findFirst({
          where: {
            id: input.relatedVoucherId,
            studyId: input.studyId,
            companyId: input.companyId
          },
          select: {
            id: true,
            thirdPartyId: true,
            letter: true,
            direction: true
          }
        });

        if (!origin) {
          return {
            ok: false,
            message: "El comprobante origen no existe en la empresa activa."
          } as VoucherResult;
        }

        if (origin.thirdPartyId !== input.thirdPartyId) {
          return {
            ok: false,
            message: "NC/ND: el comprobante origen debe tener el mismo receptor."
          } as VoucherResult;
        }

        if (origin.direction !== input.direction) {
          return {
            ok: false,
            message: "NC/ND: el comprobante origen debe ser de la misma operacion."
          } as VoucherResult;
        }

        if ((origin.letter ?? "") !== (input.letter ?? "")) {
          return {
            ok: false,
            message: "NC/ND: la letra debe coincidir con el comprobante origen."
          } as VoucherResult;
        }
      }

      // 1) Siempre registramos primero el comprobante en BORRADOR.
      // En EMITIDO el numero fiscal se asigna recien al confirmar.
      const draftNumber = input.direction === "EMITIDO" ? null : input.number;

      const voucher = await tx.voucher.create({
        data: {
          companyId: input.companyId,
          studyId: input.studyId,
          thirdPartyId: input.thirdPartyId,
          direction: input.direction,
          type: input.type,
          letter: input.letter || null,
          pointOfSale: input.pointOfSale,
          number: draftNumber,
          relatedVoucherId: input.relatedVoucherId || null,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          currency: input.currency,
          netAmount: input.netAmount,
          taxAmount: input.taxAmount,
          totalAmount: input.totalAmount,
          notes:
            input.currency === "USD" && input.exchangeRate
              ? `[fx-rate:${input.exchangeRate}] ${input.notes || ""}`.trim()
              : input.notes || null,
          status: "BORRADOR"
        }
      });

      const period = await tx.accountingPeriod.findFirst({
        where: {
          companyId: input.companyId,
          studyId: input.studyId,
          status: "ABIERTO",
          startsAt: {
            lte: input.issueDate
          },
          endsAt: {
            gte: input.issueDate
          }
        },
        orderBy: {
          startsAt: "desc"
        }
      });

      if (!period) {
        // Sin periodo abierto no se puede proponer contabilidad, pero el comprobante queda guardado.
        return {
          ok: true,
          message: "ok",
          id: voucher.id
        } as VoucherResult;
      }

      const accounts = await tx.account.findMany({
        where: {
          companyId: input.companyId,
          active: true,
          imputable: true
        },
        orderBy: {
          code: "asc"
        }
      });

      const activo = accounts.find((account) => account.type === "ACTIVO");
      const pasivo = accounts.find((account) => account.type === "PASIVO");
      const ingresos = accounts.find((account) => account.type === "INGRESOS");
      const egresos = accounts.find((account) => account.type === "EGRESOS");

      const arsAmounts = buildArsAmounts({
        currency: input.currency,
        exchangeRate: input.exchangeRate,
        netAmount: input.netAmount,
        taxAmount: input.taxAmount,
        totalAmount: input.totalAmount
      });

      let lines:
        | Array<{
            accountId: string;
            debit: number;
            credit: number;
          }>
        | null = null;

      if (input.direction === "EMITIDO" && activo && ingresos) {
        lines = [
          {
            accountId: activo.id,
            debit: Number(arsAmounts.totalArs),
            credit: 0
          },
          {
            accountId: ingresos.id,
            debit: 0,
            credit: Number(arsAmounts.netArs)
          }
        ];

        if (input.taxAmount > 0) {
          if (pasivo) {
            lines.push({
              accountId: pasivo.id,
              debit: 0,
              credit: Number(arsAmounts.taxArs)
            });
          } else {
            lines[1].credit += Number(arsAmounts.taxArs);
          }
        }
      }

      if (input.direction === "RECIBIDO" && pasivo && egresos) {
        lines = [
          {
            accountId: egresos.id,
            debit: Number(arsAmounts.netArs),
            credit: 0
          },
          {
            accountId: pasivo.id,
            debit: 0,
            credit: Number(arsAmounts.totalArs)
          }
        ];

        if (input.taxAmount > 0) {
          if (activo) {
            lines.push({
              accountId: activo.id,
              debit: Number(arsAmounts.taxArs),
              credit: 0
            });
          } else {
            lines[0].debit += Number(arsAmounts.taxArs);
          }
        }
      }

      if (!lines) {
        // Si faltan cuentas base, no se bloquea el alta del comprobante.
        return {
          ok: true,
          message: "ok",
          id: voucher.id
        } as VoucherResult;
      }

      const latest = await tx.journalEntry.findFirst({
        where: {
          companyId: input.companyId
        },
        orderBy: {
          number: "desc"
        }
      });

      const label = normalizeVoucherNumber(input.pointOfSale, draftNumber ?? "PENDIENTE");
      const entry = await tx.journalEntry.create({
        data: {
          companyId: input.companyId,
          studyId: input.studyId,
          periodId: period.id,
          number: (latest?.number ?? 0) + 1,
          date: input.issueDate,
          description: `Asiento propuesto por comprobante ${input.type} ${label}`,
          status: "BORRADOR",
          lines: {
            create: lines.map((line, index) => ({
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit,
              currency: input.currency,
              originalAmount:
                input.currency === "USD"
                  ? index === 0
                    ? input.totalAmount
                    : index === 1
                      ? input.netAmount
                      : input.taxAmount
                  : null,
              exchangeRate: input.currency === "USD" ? input.exchangeRate : null
            }))
          }
        }
      });

      await tx.voucher.update({
        where: {
          id: voucher.id
        },
        data: {
          journalEntryId: entry.id
        }
      });

      return {
        ok: true,
        message: "ok",
        id: voucher.id,
        journalEntryId: entry.id
      } as VoucherResult;
    });

    if (!result.ok) {
      return result;
    }

    return {
      ok: true,
      message: result.journalEntryId
        ? "Comprobante en borrador con asiento propuesto."
        : "Comprobante en borrador. Falta proponer asiento por periodo/cuentas.",
      id: result.id,
      journalEntryId: result.journalEntryId
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo registrar el comprobante. Revisar duplicados o conexion."
    };
  }
}

export async function cancelVoucher(input: {
  studyId: string;
  companyId: string;
  voucherId: string;
}): Promise<VoucherResult> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para anular comprobantes hace falta PostgreSQL configurado."
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Cargamos el comprobante dentro de la transaccion para evitar carreras de estado.
      const voucher = await tx.voucher.findFirst({
        where: {
          id: input.voucherId,
          studyId: input.studyId,
          companyId: input.companyId
        },
        select: {
          id: true,
          status: true,
          journalEntryId: true
        }
      });

      if (!voucher) {
        return {
          ok: false,
          message: "El comprobante no existe o no pertenece a la empresa activa."
        } as VoucherResult;
      }

      if (voucher.status !== "BORRADOR") {
        return {
          ok: false,
          message: "Solo se pueden anular comprobantes en estado BORRADOR."
        } as VoucherResult;
      }

      let deletedJournalEntryId: string | undefined;

      if (voucher.journalEntryId) {
        // Si hay asiento vinculado, exigimos que siga en BORRADOR para permitir anular todo en bloque.
        const entry = await tx.journalEntry.findFirst({
          where: {
            id: voucher.journalEntryId,
            studyId: input.studyId,
            companyId: input.companyId
          },
          select: {
            id: true,
            status: true
          }
        });

        if (!entry) {
          return {
            ok: false,
            message:
              "El asiento vinculado no existe o no pertenece a la empresa activa."
          } as VoucherResult;
        }

        if (entry.status !== "BORRADOR") {
          return {
            ok: false,
            message:
              "No se puede anular el comprobante porque el asiento vinculado no esta en BORRADOR."
          } as VoucherResult;
        }

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

        deletedJournalEntryId = entry.id;
      }

      const canceledVoucher = await tx.voucher.update({
        where: {
          id: voucher.id
        },
        data: {
          status: "ANULADO",
          journalEntryId: null
        },
        select: {
          id: true
        }
      });

      return {
        ok: true,
        message: deletedJournalEntryId
          ? "Comprobante anulado y asiento borrador vinculado eliminado."
          : "Comprobante anulado.",
        id: canceledVoucher.id,
        journalEntryId: deletedJournalEntryId
      } as VoucherResult;
    });

    return result;
  } catch {
    return {
      ok: false,
      message: "No se pudo anular el comprobante."
    };
  }
}

export async function getVoucherForConfirmation(input: {
  studyId: string;
  companyId: string;
  voucherId: string;
}): Promise<{
  ok: boolean;
  message: string;
  voucherId?: string;
  journalEntryId?: string;
}> {
  if (!hasDatabase()) {
    return {
      ok: false,
      message: "Para confirmar comprobantes hace falta PostgreSQL configurado."
    };
  }

  try {
    const voucher = await prisma.voucher.findFirst({
      where: {
        id: input.voucherId,
        studyId: input.studyId,
        companyId: input.companyId
      },
      select: {
        id: true,
        status: true,
        journalEntryId: true
      }
    });

    if (!voucher) {
      return {
        ok: false,
        message: "El comprobante no existe para la empresa activa."
      };
    }

    if (voucher.status !== "BORRADOR") {
      return {
        ok: false,
        message: "Solo se pueden confirmar comprobantes en BORRADOR."
      };
    }

    if (!voucher.journalEntryId) {
      return {
        ok: false,
        message: "El comprobante no tiene asiento vinculado para confirmar."
      };
    }

    // Devolvemos solo los ids necesarios para que la action confirme el flujo contable.
    return {
      ok: true,
      message: "ok",
      voucherId: voucher.id,
      journalEntryId: voucher.journalEntryId
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo preparar la confirmacion del comprobante."
    };
  }
}
