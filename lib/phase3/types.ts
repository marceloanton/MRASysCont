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

export type VoucherDirection = "EMITIDO" | "RECIBIDO";
export type VoucherType = "FACTURA" | "NOTA_CREDITO" | "NOTA_DEBITO" | "RECIBO" | "OTRO";
export type VoucherStatus = "BORRADOR" | "REGISTRADO" | "ANULADO";

export type VoucherSummary = {
  id: string;
  companyId: string;
  thirdPartyId: string;
  thirdPartyName: string;
  direction: VoucherDirection;
  type: VoucherType;
  letter?: string;
  pointOfSale: string;
  number: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  netAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: VoucherStatus;
  notes?: string;
};

export type VoucherResult = {
  ok: boolean;
  message: string;
  id?: string;
};
