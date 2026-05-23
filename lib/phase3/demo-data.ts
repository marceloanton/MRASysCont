import type { ThirdPartySummary } from "./types";

export const demoThirdParties: ThirdPartySummary[] = [
  {
    id: "third_alfa_cliente",
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
    companyId: "emp_gamma",
    type: "CLIENTE",
    legalName: "Consumidor Gamma",
    documentType: "DNI",
    document: "30111222",
    taxCondition: "Consumidor Final",
    active: true
  }
];
