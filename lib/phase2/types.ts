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

export type JournalEntryStatus = "BORRADOR" | "CONFIRMADO" | "ANULADO";

export type JournalEntryLineInput = {
  accountId: string;
  debit: number;
  credit: number;
};

export type JournalEntrySummary = {
  id: string;
  companyId: string;
  periodId: string;
  number: number;
  date: string;
  description: string;
  status: JournalEntryStatus;
  reversalOfEntryId?: string;
  reversedByEntryId?: string;
  reversalReason?: string;
  totalDebit: number;
  totalCredit: number;
};

export type JournalReportLine = {
  entryId: string;
  number: number;
  date: string;
  description: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
};

export type LedgerAccountReport = {
  accountId: string;
  accountCode: string;
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
  lines: JournalReportLine[];
};
