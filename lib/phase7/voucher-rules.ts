import type { VoucherStatus } from "../phase3/types";

export type VoucherTransition = {
  from: VoucherStatus;
  to: VoucherStatus;
};

export function hasVoucherTenantScope(input: {
  studyId?: string | null;
  companyId?: string | null;
}) {
  return Boolean(input.studyId && input.companyId);
}

export function canCreateVoucherForCompany(input: {
  actorStudyId: string;
  actorCompanyId: string;
  targetStudyId: string;
  targetCompanyId: string;
}) {
  return (
    input.actorStudyId === input.targetStudyId &&
    input.actorCompanyId === input.targetCompanyId
  );
}

export function isVoucherNumberUniqueByPointOfSaleAndType(input: {
  pointOfSale: string;
  type: string;
  number: string;
  existing: Array<{ pointOfSale: string; type: string; number?: string | null }>;
}) {
  return !input.existing.some(
    (voucher) =>
      voucher.pointOfSale === input.pointOfSale &&
      voucher.type === input.type &&
      (voucher.number ?? "") === input.number
  );
}

export function shouldAssignNumberOnConfirm(input: {
  direction: "EMITIDO" | "RECIBIDO";
  currentNumber?: string | null;
}) {
  return input.direction === "EMITIDO" && !input.currentNumber;
}

export function canConfirmVoucher(input: {
  voucherStatus: VoucherStatus;
  hasLinkedEntry: boolean;
  linkedEntryBalanced: boolean;
  periodStatus: "ABIERTO" | "CERRADO";
}) {
  if (input.voucherStatus !== "BORRADOR") return false;
  if (!input.hasLinkedEntry) return false;
  if (!input.linkedEntryBalanced) return false;
  if (input.periodStatus !== "ABIERTO") return false;
  return true;
}

export function isVoucherTransitionValid(input: VoucherTransition) {
  if (input.from === "BORRADOR" && (input.to === "REGISTRADO" || input.to === "ANULADO")) {
    return true;
  }
  return false;
}

export function buildVoucherQrPayloadForLocal(input: {
  issueDate: string;
  cuit: string;
  pointOfSale: number;
  voucherTypeCode: number;
  voucherNumber: number;
  totalAmount: number;
  receiverDocType: number;
  receiverDocNumber: number;
}) {
  return {
    ver: 1,
    fecha: input.issueDate,
    cuit: Number(input.cuit.replaceAll("-", "")),
    ptoVta: input.pointOfSale,
    tipoCmp: input.voucherTypeCode,
    nroCmp: input.voucherNumber,
    importe: Number(input.totalAmount.toFixed(2)),
    moneda: "PES",
    ctz: 1,
    tipoDocRec: input.receiverDocType,
    nroDocRec: input.receiverDocNumber,
    tipoCodAut: "E",
    codAut: 0
  };
}

export function canAccessVoucherPdfFromCompany(input: {
  actorStudyId: string;
  actorCompanyId: string;
  voucherStudyId: string;
  voucherCompanyId: string;
}) {
  return (
    input.actorStudyId === input.voucherStudyId &&
    input.actorCompanyId === input.voucherCompanyId
  );
}
