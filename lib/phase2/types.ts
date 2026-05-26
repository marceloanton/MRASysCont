export type AccountType =
  | "ACTIVO"
  | "PASIVO"
  | "PATRIMONIO"
  | "INGRESOS"
  | "EGRESOS"
  | "ORDEN";

export type AccountTemplateLine = {
  code: string;
  name: string;
  type: AccountType;
  imputable: boolean;
};

export type AccountChartTemplate = {
  id: string;
  name: string;
  lines: AccountTemplateLine[];
};

export type AccountSummary = {
  id: string;
  studyId?: string;
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
  studyId?: string;
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

export type JournalEntryLineSummary = {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
};

export type JournalEntrySummary = {
  id: string;
  studyId?: string;
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
  lines: JournalEntryLineSummary[];
};

export type JournalReportLine = {
  entryId: string;
  number: number;
  date: string;
  description: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  debit: number;
  credit: number;
  currency?: string;
  originalAmount?: number;
  exchangeRate?: number;
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

export type TrialBalanceLine = {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  totalDebit: number;
  totalCredit: number;
  debitBalance: number;
  creditBalance: number;
};
