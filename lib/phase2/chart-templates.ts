import type { AccountChartTemplate } from "./types";

export const accountChartTemplates: AccountChartTemplate[] = [
  {
    id: "basico_servicios_ar",
    name: "Basico Servicios AR",
    lines: [
      { code: "1.01.001", name: "Caja", type: "ACTIVO", imputable: true },
      { code: "1.01.002", name: "Banco", type: "ACTIVO", imputable: true },
      { code: "1.03.001", name: "Creditos por ventas", type: "ACTIVO", imputable: true },
      { code: "2.01.001", name: "Proveedores", type: "PASIVO", imputable: true },
      { code: "2.03.001", name: "IVA Debito Fiscal", type: "PASIVO", imputable: true },
      { code: "2.03.002", name: "IVA Credito Fiscal", type: "ACTIVO", imputable: true },
      { code: "3.01.001", name: "Capital", type: "PATRIMONIO", imputable: true },
      { code: "4.01.001", name: "Ventas", type: "INGRESOS", imputable: true },
      { code: "5.01.001", name: "Gastos Administrativos", type: "EGRESOS", imputable: true }
    ]
  }
];

export function getAccountChartTemplate(templateId: string) {
  return accountChartTemplates.find((template) => template.id === templateId);
}
