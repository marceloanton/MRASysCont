import type { ThirdPartyStatement, VoucherSummary } from "./types";

function signedVoucherAmount(voucher: VoucherSummary) {
  const amount = voucher.totalAmount;
  const inverted = voucher.type === "NOTA_CREDITO";

  if (voucher.direction === "EMITIDO") {
    return inverted ? -amount : amount;
  }

  return inverted ? amount : -amount;
}

export function buildThirdPartyStatements(vouchers: VoucherSummary[]): ThirdPartyStatement[] {
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

    if (impact >= 0) {
      current.receivable += impact;
    } else {
      current.payable += Math.abs(impact);
    }

    current.netBalance += impact;
    current.lines.push({
      voucherId: voucher.id,
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

  return Array.from(statements.values()).sort((a, b) =>
    a.thirdPartyName.localeCompare(b.thirdPartyName)
  );
}
