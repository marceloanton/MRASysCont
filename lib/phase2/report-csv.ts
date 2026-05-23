import type { JournalReportLine, LedgerAccountReport, TrialBalanceLine } from "./types";

function protectCsvText(value: string) {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }

  return value;
}

export function csvValue(value: string | number) {
  const raw = typeof value === "number" ? String(value) : protectCsvText(value);
  return `"${raw.replaceAll("\"", "\"\"")}"`;
}

export function toCsv(rows: Array<Array<string | number>>) {
  return `\uFEFF${rows.map((row) => row.map(csvValue).join(";")).join("\r\n")}\r\n`;
}

export function buildTrialBalanceCsv(lines: TrialBalanceLine[]) {
  return toCsv([
    ["Cuenta", "Nombre", "Tipo", "Debe", "Haber", "Saldo deudor", "Saldo acreedor"],
    ...lines.map((line) => [
      line.accountCode,
      line.accountName,
      line.accountType,
      line.totalDebit,
      line.totalCredit,
      line.debitBalance,
      line.creditBalance
    ])
  ]);
}

export function buildJournalCsv(lines: JournalReportLine[]) {
  return toCsv([
    ["Asiento", "Fecha", "Descripcion", "Cuenta", "Nombre", "Debe", "Haber"],
    ...lines.map((line) => [
      line.number,
      line.date,
      line.description,
      line.accountCode,
      line.accountName,
      line.debit,
      line.credit
    ])
  ]);
}

export function buildLedgerCsv(accounts: LedgerAccountReport[]) {
  return toCsv([
    ["Cuenta", "Nombre", "Fecha", "Asiento", "Descripcion", "Debe", "Haber", "Saldo cuenta"],
    ...accounts.flatMap((account) =>
      account.lines.map((line) => [
        account.accountCode,
        account.accountName,
        line.date,
        line.number,
        line.description,
        line.debit,
        line.credit,
        account.balance
      ])
    )
  ]);
}
