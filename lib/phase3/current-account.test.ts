import { describe, expect, it } from "vitest";
import { buildThirdPartyStatements } from "./current-account";
import type { VoucherSummary } from "./types";

const baseVoucher: VoucherSummary = {
  id: "voucher_1",
  companyId: "emp",
  thirdPartyId: "third",
  thirdPartyName: "Cliente",
  direction: "EMITIDO",
  type: "FACTURA",
  pointOfSale: "0001",
  number: "00000001",
  issueDate: "2026-01-01",
  currency: "ARS",
  netAmount: 100,
  taxAmount: 21,
  totalAmount: 121,
  status: "REGISTRADO"
};

describe("third party current account", () => {
  it("adds emitted invoices as receivable", () => {
    const [statement] = buildThirdPartyStatements([baseVoucher]);

    expect(statement.receivable).toBe(121);
    expect(statement.payable).toBe(0);
    expect(statement.netBalance).toBe(121);
  });

  it("applies collections against receivable balance", () => {
    const [statement] = buildThirdPartyStatements(
      [baseVoucher],
      [
        {
          id: "settlement_1",
          companyId: "emp",
          thirdPartyId: "third",
          thirdPartyName: "Cliente",
          direction: "COBRO",
          date: "2026-01-02",
          currency: "ARS",
          amount: 21,
          method: "Transferencia"
        }
      ]
    );

    expect(statement.netBalance).toBe(100);
  });

  it("adds received invoices as payable", () => {
    const [statement] = buildThirdPartyStatements([
      {
        ...baseVoucher,
        direction: "RECIBIDO"
      }
    ]);

    expect(statement.receivable).toBe(0);
    expect(statement.payable).toBe(121);
    expect(statement.netBalance).toBe(-121);
  });

  it("applies payments against payable balance", () => {
    const [statement] = buildThirdPartyStatements(
      [
        {
          ...baseVoucher,
          direction: "RECIBIDO"
        }
      ],
      [
        {
          id: "settlement_1",
          companyId: "emp",
          thirdPartyId: "third",
          thirdPartyName: "Cliente",
          direction: "PAGO",
          date: "2026-01-02",
          currency: "ARS",
          amount: 21,
          method: "Transferencia"
        }
      ]
    );

    expect(statement.netBalance).toBe(-100);
  });

  it("ignores cancelled vouchers and inverts credit notes", () => {
    const [statement] = buildThirdPartyStatements([
      baseVoucher,
      {
        ...baseVoucher,
        id: "voucher_2",
        type: "NOTA_CREDITO",
        totalAmount: 21
      },
      {
        ...baseVoucher,
        id: "voucher_3",
        status: "ANULADO",
        totalAmount: 999
      }
    ]);

    expect(statement.netBalance).toBe(100);
  });
});
