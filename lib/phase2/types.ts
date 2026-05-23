export type AccountType =
  | "ACTIVO"
  | "PASIVO"
  | "PATRIMONIO"
  | "INGRESOS"
  | "EGRESOS"
  | "ORDEN";

export type AccountSummary = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  type: AccountType;
  imputable: boolean;
  active: boolean;
};

export type AccountingPeriodStatus = "ABIERTO" | "CERRADO";

export type AccountingPeriodSummary = {
  id: string;
  companyId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  status: AccountingPeriodStatus;
};

export type AccountingResult = {
  ok: boolean;
  message: string;
  id?: string;
};
