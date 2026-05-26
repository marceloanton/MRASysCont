export type ThirdPartyType = "CLIENTE" | "PROVEEDOR" | "CLIENTE_PROVEEDOR";

export type ThirdPartySummary = {
  id: string;
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
  studyId: string;
  companyId: string;
  thirdPartyId: string;
  thirdPartyName: string;
  journalEntryId?: string;
  relatedVoucherId?: string;
  direction: VoucherDirection;
  type: VoucherType;
  letter?: string;
  pointOfSale: string;
  number?: string;
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
  journalEntryId?: string;
};

export type ThirdPartyStatementLine = {
  id: string;
  issueDate: string;
  direction: VoucherDirection | SettlementDirection;
  type: VoucherType | "COBRO" | "PAGO";
  number: string;
  currency: string;
  debit: number;
  credit: number;
  balanceImpact: number;
  treasuryAccountName?: string;
};

export type ThirdPartyStatement = {
  thirdPartyId: string;
  thirdPartyName: string;
  document: string;
  receivable: number;
  payable: number;
  netBalance: number;
  lines: ThirdPartyStatementLine[];
};

export type SettlementDirection = "COBRO" | "PAGO";

export type SettlementSummary = {
  id: string;
  studyId: string;
  companyId: string;
  thirdPartyId: string;
  thirdPartyName: string;
  treasuryAccountId?: string;
  treasuryAccountName?: string;
  treasuryMovementId?: string;
  direction: SettlementDirection;
  date: string;
  currency: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
};

export type SettlementResult = {
  ok: boolean;
  message: string;
  id?: string;
};
