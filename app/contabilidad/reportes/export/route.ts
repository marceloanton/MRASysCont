import { NextRequest } from "next/server";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  buildJournalCsv,
  buildLedgerCsv,
  buildTrialBalanceCsv
} from "@/lib/phase4-accounting/report-csv";
import { getAccountingReports } from "@/lib/phase4-accounting/reports";
import {
  buildVatBookCsv,
  buildVatBookExcelXml,
  buildVatMonthlyCsv,
  buildVatReconciliationCsv
} from "@/lib/phase8/vat-csv";
import { getVatReports } from "@/lib/phase8/reports";

const reportTypes = [
  "balance",
  "diario",
  "mayor",
  "iva-ventas",
  "iva-compras",
  "iva-mensual",
  "iva-conciliacion"
] as const;
type ReportType = (typeof reportTypes)[number];

function isReportType(value: string | null): value is ReportType {
  return reportTypes.some((type) => type === value);
}

function csvFilename(type: ReportType, companyId: string, periodId?: string) {
  const periodPart = periodId ? `periodo-${periodId}` : "todos";
  return `mrasyscont-${companyId}-${type}-${periodPart}.csv`;
}

export async function GET(request: NextRequest) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return new Response("No autenticado", { status: 401 });
  }

  const tenant = getActiveTenantFromCompanies(
    workspace.session,
    workspace.companies
  );
  const type = request.nextUrl.searchParams.get("type");
  const format = request.nextUrl.searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  if (!isReportType(type)) {
    return new Response("Tipo de reporte invalido", { status: 400 });
  }

  const periodParam = request.nextUrl.searchParams.get("periodId");
  const periodId = periodParam && periodParam !== "todos" ? periodParam : undefined;

  if (type.startsWith("iva-") && !periodId) {
    return new Response("Periodo requerido para exportacion IVA", { status: 422 });
  }

  if (type === "balance" || type === "diario" || type === "mayor") {
    const reports = await getAccountingReports({
      studyId: tenant.company.studyId,
      companyId: tenant.company.id,
      periodId
    });
    const csv =
      type === "balance"
        ? buildTrialBalanceCsv(reports.trialBalanceLines)
        : type === "diario"
          ? buildJournalCsv(reports.journalLines)
          : buildLedgerCsv(reports.ledgerAccounts);

    return new Response(csv, {
      headers: {
        "Content-Disposition": `attachment; filename="${csvFilename(
          type,
          tenant.company.id,
          periodId
        )}"`,
        "Content-Type": "text/csv; charset=utf-8"
      }
    });
  }

  const vatReports = await getVatReports({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    periodId
  });

  recordAuditEvent({
    studyId: tenant.company.studyId,
    companyId: tenant.company.id,
    userId: workspace.session.user.id,
    action: "phase8.vat_export.generated",
    entity: "VatExport",
    entityId: `${type}-${periodId}`,
    metadata: {
      format,
      periodId: periodId ?? null
    }
  });

  if (format === "xlsx") {
    const matrix =
      type === "iva-ventas"
        ? [
            ["Fecha", "Tipo", "PtoVta", "Numero", "Tercero", "Operacion", "Alicuota", "Base", "IVA", "Total"],
            ...vatReports.salesBook.map((row) => [
              row.issueDate,
              row.type,
              row.pointOfSale,
              row.number ?? "",
              row.thirdPartyName,
              row.operationType,
              row.vatRate,
              row.taxableBase,
              row.vatAmount,
              row.totalAmount
            ])
          ]
        : type === "iva-compras"
          ? [
              ["Fecha", "Tipo", "PtoVta", "Numero", "Tercero", "Operacion", "Alicuota", "Base", "IVA", "Total"],
              ...vatReports.purchasesBook.map((row) => [
                row.issueDate,
                row.type,
                row.pointOfSale,
                row.number ?? "",
                row.thirdPartyName,
                row.operationType,
                row.vatRate,
                row.taxableBase,
                row.vatAmount,
                row.totalAmount
              ])
            ]
          : type === "iva-mensual"
            ? [
                ["Periodo", "Debito", "Credito", "Neto IVA"],
                [
                  vatReports.monthly.periodId ?? "",
                  vatReports.monthly.salesVatDebitFiscal,
                  vatReports.monthly.purchasesVatCreditFiscal,
                  vatReports.monthly.netVatPayable
                ]
              ]
            : [
                ["Periodo", "Debito esperado", "Debito contable", "Dif debito", "Credito esperado", "Credito contable", "Dif credito"],
                [
                  vatReports.reconciliation.periodId ?? "",
                  vatReports.reconciliation.expectedVatDebitFiscal,
                  vatReports.reconciliation.accountingVatDebitFiscal,
                  vatReports.reconciliation.debitDifference,
                  vatReports.reconciliation.expectedVatCreditFiscal,
                  vatReports.reconciliation.accountingVatCreditFiscal,
                  vatReports.reconciliation.creditDifference
                ]
              ];

    const xml = buildVatBookExcelXml(type, matrix);
    return new Response(xml, {
      headers: {
        "Content-Disposition": `attachment; filename="${csvFilename(
          type,
          tenant.company.id,
          periodId
        ).replace(".csv", ".xml")}"`,
        "Content-Type": "application/vnd.ms-excel"
      }
    });
  }

  const csv =
    type === "iva-ventas"
      ? buildVatBookCsv(vatReports.salesBook)
      : type === "iva-compras"
        ? buildVatBookCsv(vatReports.purchasesBook)
        : type === "iva-mensual"
          ? buildVatMonthlyCsv(vatReports.monthly)
          : buildVatReconciliationCsv(vatReports.reconciliation);

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${csvFilename(
        type,
        tenant.company.id,
        periodId
      )}"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
