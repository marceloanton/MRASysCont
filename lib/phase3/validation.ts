import type { ThirdPartyType } from "./types";

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
