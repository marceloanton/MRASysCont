import type { SettlementSummary, ThirdPartySummary, VoucherSummary } from "./types";

export const demoThirdParties: ThirdPartySummary[] = [
  {
    id: "third_alfa_cliente",
    studyId: "std_default",
    companyId: "emp_alfa",
    type: "CLIENTE",
    legalName: "Cliente Demo SA",
    tradeName: "Cliente Demo",
    documentType: "CUIT",
    document: "30-71111111-1",
    taxCondition: "Responsable Inscripto",
    email: "administracion@cliente-demo.local",
    phone: "011-4000-1000",
    address: "Av. Contable 123",
    active: true
  },
  {
    id: "third_alfa_proveedor",
    studyId: "std_default",
    companyId: "emp_alfa",
    type: "PROVEEDOR",
    legalName: "Proveedor Demo SRL",
    tradeName: "Proveedor Demo",
    documentType: "CUIT",
    document: "30-72222222-2",
    taxCondition: "Responsable Inscripto",
    email: "facturas@proveedor-demo.local",
    active: true
  },
  {
    id: "third_gamma_cliente",
    studyId: "std_default",
    companyId: "emp_gamma",
    type: "CLIENTE",
    legalName: "Consumidor Gamma",
    documentType: "DNI",
    document: "30111222",
    taxCondition: "Consumidor Final",
    active: true
  }
];

export const demoVouchers: VoucherSummary[] = [
  {
    id: "voucher_alfa_emitido_1",
    studyId: "std_default",
    companyId: "emp_alfa",
    thirdPartyId: "third_alfa_cliente",
    thirdPartyName: "Cliente Demo SA",
    direction: "EMITIDO",
    type: "FACTURA",
    letter: "A",
    pointOfSale: "0001",
    number: "00000001",
    issueDate: "2026-01-15",
    dueDate: "2026-01-25",
    currency: "ARS",
    netAmount: 100000,
    taxAmount: 21000,
    totalAmount: 121000,
    status: "REGISTRADO",
    notes: "Comprobante demo sin CAE"
  },
  {
    id: "voucher_alfa_recibido_1",
    studyId: "std_default",
    companyId: "emp_alfa",
    thirdPartyId: "third_alfa_proveedor",
    thirdPartyName: "Proveedor Demo SRL",
    direction: "RECIBIDO",
    type: "FACTURA",
    letter: "A",
    pointOfSale: "0003",
    number: "00000125",
    issueDate: "2026-01-16",
    currency: "ARS",
    netAmount: 25000,
    taxAmount: 5250,
    totalAmount: 30250,
    status: "REGISTRADO",
    notes: "Factura recibida demo"
  }
];

export const demoSettlements: SettlementSummary[] = [
  {
    id: "settlement_alfa_cobro_1",
    studyId: "std_default",
    companyId: "emp_alfa",
    thirdPartyId: "third_alfa_cliente",
    thirdPartyName: "Cliente Demo SA",
    treasuryAccountId: "treasury_alfa_caja",
    treasuryAccountName: "Caja principal",
    treasuryMovementId: "treasury_mov_alfa_1",
    direction: "COBRO",
    date: "2026-01-20",
    currency: "ARS",
    amount: 21000,
    method: "Transferencia",
    reference: "TRX-DEMO-001",
    notes: "Cobro parcial demo"
  },
  {
    id: "settlement_alfa_pago_1",
    studyId: "std_default",
    companyId: "emp_alfa",
    thirdPartyId: "third_alfa_proveedor",
    thirdPartyName: "Proveedor Demo SRL",
    treasuryAccountId: "treasury_alfa_banco",
    treasuryAccountName: "Banco operativo",
    treasuryMovementId: "treasury_mov_alfa_2",
    direction: "PAGO",
    date: "2026-01-22",
    currency: "ARS",
    amount: 10000,
    method: "Transferencia",
    reference: "TRX-DEMO-002",
    notes: "Pago parcial demo"
  }
];
