import type { SettlementSummary, ThirdPartyStatement, VoucherSummary } from "./types";

function signedVoucherAmount(voucher: VoucherSummary) {
  const amount = voucher.totalAmount;
  const inverted = voucher.type === "NOTA_CREDITO";

  if (voucher.direction === "EMITIDO") {
    return inverted ? -amount : amount;
  }

  return inverted ? amount : -amount;
}

function applyImpact(
  statement: ThirdPartyStatement,
  impact: number,
  line: ThirdPartyStatement["lines"][number]
) {
  if (impact >= 0) {
    statement.receivable += impact;
  } else {
    statement.payable += Math.abs(impact);
  }

  statement.netBalance += impact;
  statement.lines.push(line);
}

export function buildThirdPartyStatements(
  vouchers: VoucherSummary[],
  settlements: SettlementSummary[] = []
): ThirdPartyStatement[] {
  const statements = new Map<string, ThirdPartyStatement>();

  for (const voucher of vouchers.filter((item) => item.status !== "ANULADO")) {
    const current = statements.get(voucher.thirdPartyId) ?? {
      thirdPartyId: voucher.thirdPartyId,
      thirdPartyName: voucher.thirdPartyName,
      document: "",
      receivable: 0,
      payable: 0,
      netBalance: 0,
      lines: []
    };
    const impact = signedVoucherAmount(voucher);

    applyImpact(current, impact, {
      id: voucher.id,
      issueDate: voucher.issueDate,
      direction: voucher.direction,
      type: voucher.type,
      number: `${voucher.pointOfSale}-${voucher.number}`,
      currency: voucher.currency,
      debit: impact > 0 ? impact : 0,
      credit: impact < 0 ? Math.abs(impact) : 0,
      balanceImpact: impact
    });
    statements.set(voucher.thirdPartyId, current);
  }

  for (const settlement of settlements) {
    const current = statements.get(settlement.thirdPartyId) ?? {
      thirdPartyId: settlement.thirdPartyId,
      thirdPartyName: settlement.thirdPartyName,
      document: "",
      receivable: 0,
      payable: 0,
      netBalance: 0,
      lines: []
    };
    const impact = settlement.direction === "COBRO" ? -settlement.amount : settlement.amount;

    applyImpact(current, impact, {
      id: settlement.id,
      issueDate: settlement.date,
      direction: settlement.direction,
      type: settlement.direction,
      number: settlement.reference ?? settlement.method,
      currency: settlement.currency,
      debit: impact > 0 ? impact : 0,
      credit: impact < 0 ? Math.abs(impact) : 0,
      balanceImpact: impact,
      treasuryAccountName: settlement.treasuryAccountName
    });
    statements.set(settlement.thirdPartyId, current);
  }

  return Array.from(statements.values())
    .map((statement) => ({
      ...statement,
      lines: statement.lines.sort((a, b) => a.issueDate.localeCompare(b.issueDate))
    }))
    .sort((a, b) => a.thirdPartyName.localeCompare(b.thirdPartyName));
}
