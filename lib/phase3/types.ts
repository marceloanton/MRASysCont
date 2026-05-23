export type ThirdPartyType = "CLIENTE" | "PROVEEDOR" | "CLIENTE_PROVEEDOR";

export type ThirdPartySummary = {
  id: string;
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
  active: boolean;
};

export type ThirdPartyResult = {
  ok: boolean;
  message: string;
  id?: string;
};
