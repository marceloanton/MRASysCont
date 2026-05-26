import { toCsv } from "@/lib/phase4-accounting/report-csv";
import type { VatBookRow, VatMonthlyReport, VatReconciliation } from "./types";

export function buildVatBookCsv(rows: VatBookRow[]) {
  return toCsv([
    [
      "Fecha",
      "Tipo",
      "Letra",
      "PtoVta",
      "Numero",
      "Tercero",
      "Operacion IVA",
      "Alicuota",
      "Base imponible",
      "Exento",
      "No gravado",
      "IVA",
      "Total"
    ],
    ...rows.map((row) => [
      row.issueDate,
      row.type,
      row.letter ?? "",
      row.pointOfSale,
      row.number ?? "",
      row.thirdPartyName,
      row.operationType,
      row.vatRate,
      row.taxableBase,
      row.exemptAmount,
      row.nonTaxedAmount,
      row.vatAmount,
      row.totalAmount
    ])
  ]);
}

export function buildVatMonthlyCsv(report: VatMonthlyReport) {
  return toCsv([
    [
      "Periodo",
      "Base imponible ventas",
      "Base imponible compras",
      "IVA debito fiscal",
      "IVA credito fiscal",
      "Exento ventas",
      "Exento compras",
      "No gravado ventas",
      "No gravado compras",
      "Neto IVA"
    ],
    [
      report.periodId ?? "todos",
      report.salesTaxableBase,
      report.purchasesTaxableBase,
      report.salesVatDebitFiscal,
      report.purchasesVatCreditFiscal,
      report.salesExemptAmount,
      report.purchasesExemptAmount,
      report.salesNonTaxedAmount,
      report.purchasesNonTaxedAmount,
      report.netVatPayable
    ]
  ]);
}

export function buildVatReconciliationCsv(report: VatReconciliation) {
  return toCsv([
    [
      "Periodo",
      "IVA debito esperado",
      "IVA debito contable",
      "Dif. debito",
      "IVA credito esperado",
      "IVA credito contable",
      "Dif. credito"
    ],
    [
      report.periodId ?? "todos",
      report.expectedVatDebitFiscal,
      report.accountingVatDebitFiscal,
      report.debitDifference,
      report.expectedVatCreditFiscal,
      report.accountingVatCreditFiscal,
      report.creditDifference
    ]
  ]);
}

export function buildVatBookExcelXml(sheetName: string, rows: Array<Array<string | number>>) {
  const xmlRows = rows
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="${typeof cell === "number" ? "Number" : "String"}">${String(cell)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")}</Data></Cell>`)
          .join("")}</Row>`
    )
    .join("");

  return `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${sheetName}">
    <Table>${xmlRows}</Table>
  </Worksheet>
</Workbook>`;
}
