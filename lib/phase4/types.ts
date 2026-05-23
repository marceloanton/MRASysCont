export type TreasuryAccountType = "CAJA" | "BANCO" | "BILLETERA";
export type TreasuryMovementType = "INGRESO" | "EGRESO" | "TRANSFERENCIA" | "AJUSTE";

export type TreasuryAccountSummary = {
  id: string;
  companyId: string;
  type: TreasuryAccountType;
  name: string;
  currency: string;
  bankName?: string;
  accountNumber?: string;
  active: boolean;
  balance: number;
};

export type TreasuryMovementSummary = {
  id: string;
  companyId: string;
  treasuryAccountId: string;
  treasuryAccountName: string;
  type: TreasuryMovementType;
  date: string;
  currency: string;
  amount: number;
  signedAmount: number;
  description: string;
  reference?: string;
};

export type TreasuryResult = {
  ok: boolean;
  message: string;
  id?: string;
};
