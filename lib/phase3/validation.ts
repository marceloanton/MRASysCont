import type {
  SettlementDirection,
  ThirdPartyType,
  VoucherDirection,
  VoucherType
} from "./types";

export const thirdPartyTypes: ThirdPartyType[] = [
  "CLIENTE",
  "PROVEEDOR",
  "CLIENTE_PROVEEDOR"
];

export function isThirdPartyType(value: string): value is ThirdPartyType {
  return thirdPartyTypes.includes(value as ThirdPartyType);
}

export function normalizeDocument(document: string) {
  return document.trim().replaceAll(" ", "");
}

export function validateDocument(document: string) {
  return /^[0-9]{2}-?[0-9]{8}-?[0-9]$|^[0-9]{7,11}$/.test(normalizeDocument(document));
}

export const voucherDirections: VoucherDirection[] = ["EMITIDO", "RECIBIDO"];
export const voucherTypes: VoucherType[] = [
  "FACTURA",
  "NOTA_CREDITO",
  "NOTA_DEBITO",
  "RECIBO",
  "OTRO"
];

export function isVoucherDirection(value: string): value is VoucherDirection {
  return voucherDirections.includes(value as VoucherDirection);
}

export function isVoucherType(value: string): value is VoucherType {
  return voucherTypes.includes(value as VoucherType);
}

export function validateVoucherNumber(value: string) {
  return /^[0-9]{1,8}$/.test(value.trim());
}

export function validatePointOfSale(value: string) {
  return /^[0-9]{4}$/.test(value.trim());
}

export function validateVoucherSerial(value: string) {
  return /^[0-9]{8}$/.test(value.trim());
}

export function validateVoucherAmounts(input: {
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
}) {
  const netCents = Math.round(input.netAmount * 100);
  const taxCents = Math.round(input.taxAmount * 100);
  const totalCents = Math.round(input.totalAmount * 100);

  return (
    netCents >= 0 &&
    taxCents >= 0 &&
    totalCents > 0 &&
    netCents + taxCents === totalCents
  );
}

export const settlementDirections: SettlementDirection[] = ["COBRO", "PAGO"];

export function isSettlementDirection(value: string): value is SettlementDirection {
  return settlementDirections.includes(value as SettlementDirection);
}

export function validatePositiveAmount(amount: number) {
  return Number.isFinite(amount) && Math.round(amount * 100) > 0;
}

export function validateMovementScope(input: {
  studyId?: string;
  companyId?: string;
  thirdPartyId?: string;
}) {
  return Boolean(input.studyId && input.companyId && input.thirdPartyId);
}

function normalizedTaxCondition(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();
}

export function isResponsableInscripto(value: string) {
  return normalizedTaxCondition(value).includes("RESPONSABLE INSCRIPTO");
}

export function isMonotributista(value: string) {
  return normalizedTaxCondition(value).includes("MONOTRIB");
}

export function isConsumidorFinal(value: string) {
  return normalizedTaxCondition(value).includes("CONSUMIDOR FINAL");
}
