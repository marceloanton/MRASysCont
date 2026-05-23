import { NextRequest } from "next/server";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import {
  buildJournalCsv,
  buildLedgerCsv,
  buildTrialBalanceCsv
} from "@/lib/phase2/report-csv";
import { getAccountingReports } from "@/lib/phase2/reports";

const reportTypes = ["balance", "diario", "mayor"] as const;
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

  if (!isReportType(type)) {
    return new Response("Tipo de reporte invalido", { status: 400 });
  }

  const periodParam = request.nextUrl.searchParams.get("periodId");
  const periodId = periodParam && periodParam !== "todos" ? periodParam : undefined;
  const reports = await getAccountingReports({
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
