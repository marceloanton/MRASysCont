import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getWorkspaceContext } from "@/lib/phase1/session";
import { getActiveTenantFromCompanies } from "@/lib/phase1/tenant-access";
import { buildVoucherQrPayloadForLocal } from "@/lib/phase7/voucher-rules";

function money(value: number) {
  return value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toWordsArs(value: number) {
  return `${money(value)} pesos argentinos`;
}

function afipVoucherTypeCode(type: string, letter?: string | null) {
  if (type === "FACTURA" && letter === "A") return 1;
  if (type === "FACTURA" && letter === "B") return 6;
  if (type === "FACTURA" && letter === "C") return 11;
  if (type === "NOTA_CREDITO" && letter === "A") return 3;
  if (type === "NOTA_CREDITO" && letter === "B") return 8;
  if (type === "NOTA_CREDITO" && letter === "C") return 13;
  if (type === "NOTA_DEBITO" && letter === "A") return 2;
  if (type === "NOTA_DEBITO" && letter === "B") return 7;
  if (type === "NOTA_DEBITO" && letter === "C") return 12;
  return 999;
}

function buildQrUrl(input: {
  cuit: string;
  issueDate: string;
  pointOfSale: number;
  voucherTypeCode: number;
  voucherNumber: number;
  totalAmount: number;
  receiverDocType: number;
  receiverDocNumber: number;
}) {
  // Fase 7: QR local con codAut placeholder (sin CAE real).
  const payload = buildVoucherQrPayloadForLocal({
    cuit: input.cuit,
    issueDate: input.issueDate,
    pointOfSale: input.pointOfSale,
    voucherTypeCode: input.voucherTypeCode,
    voucherNumber: input.voucherNumber,
    totalAmount: input.totalAmount,
    receiverDocType: input.receiverDocType,
    receiverDocNumber: input.receiverDocNumber
  });

  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  return `https://www.afip.gob.ar/fe/qr/?p=${encoded}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ voucherId: string }> }
) {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    return NextResponse.json({ message: "No hay sesion activa." }, { status: 401 });
  }

  const tenant = getActiveTenantFromCompanies(workspace.session, workspace.companies);
  const { voucherId } = await context.params;

  const voucher = await prisma.voucher.findFirst({
    where: {
      id: voucherId,
      studyId: tenant.company.studyId,
      companyId: tenant.company.id
    },
    include: {
      thirdParty: true,
      company: true
    }
  });

  if (!voucher) {
    return NextResponse.json(
      { message: "Comprobante no encontrado para la empresa activa." },
      { status: 404 }
    );
  }

  const receiverTaxCondition = voucher.thirdParty.taxCondition?.trim();
  if (!receiverTaxCondition) {
    return NextResponse.json(
      { message: "Condicion IVA del receptor obligatoria para representar el comprobante." },
      { status: 422 }
    );
  }

  const voucherCode = afipVoucherTypeCode(voucher.type, voucher.letter);
  const voucherNumberForQr = Number(voucher.number ?? 0);
  const qrUrl = buildQrUrl({
    cuit: voucher.company.cuit,
    issueDate: toIsoDate(voucher.issueDate),
    pointOfSale: Number(voucher.pointOfSale),
    voucherTypeCode: voucherCode,
    voucherNumber: voucherNumberForQr,
    totalAmount: Number(voucher.totalAmount),
    receiverDocType: voucher.thirdParty.documentType === "CUIT" ? 80 : 96,
    receiverDocNumber: Number(voucher.thirdParty.document.replaceAll("-", "")) || 0
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  const { width, height } = page.getSize();

  const left = 36;
  const right = width - 36;
  let y = height - 40;

  page.drawRectangle({
    x: left,
    y: y - 110,
    width: right - left,
    height: 110,
    borderColor: rgb(0.65, 0.65, 0.65),
    borderWidth: 1
  });

  page.drawText(voucher.company.legalName, { x: left + 10, y: y - 20, size: 16, font: bold });
  page.drawText(`CUIT emisor: ${voucher.company.cuit}`, { x: left + 10, y: y - 40, size: 10, font });
  page.drawText(`Condicion IVA emisor: ${voucher.company.taxCondition}`, {
    x: left + 10,
    y: y - 56,
    size: 10,
    font
  });
  page.drawText("Domicilio fiscal: A completar por empresa", {
    x: left + 10,
    y: y - 72,
    size: 10,
    font
  });

  page.drawText(`${voucher.letter ?? "X"}`, { x: right - 170, y: y - 45, size: 40, font: bold });
  page.drawText((voucher.type ?? "COMPROBANTE").replaceAll("_", " "), {
    x: right - 195,
    y: y - 70,
    size: 10,
    font
  });
  page.drawText(`Punto de venta: ${voucher.pointOfSale}`, {
    x: right - 130,
    y: y - 20,
    size: 10,
    font
  });
  page.drawText(`Numero: ${voucher.number ?? "PENDIENTE"}`, { x: right - 130, y: y - 36, size: 10, font });
  page.drawText(`Fecha emision: ${toIsoDate(voucher.issueDate)}`, {
    x: right - 130,
    y: y - 52,
    size: 10,
    font
  });

  y -= 126;
  page.drawText(`Receptor: ${voucher.thirdParty.legalName}`, { x: left, y, size: 11, font: bold });
  y -= 16;
  page.drawText(
    `${voucher.thirdParty.documentType}: ${voucher.thirdParty.document} | Condicion IVA receptor: ${receiverTaxCondition}`,
    { x: left, y, size: 10, font }
  );
  y -= 22;

  page.drawLine({
    start: { x: left, y },
    end: { x: right, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85)
  });
  y -= 16;

  page.drawText("Descripcion", { x: left, y, size: 10, font: bold });
  page.drawText("Neto", { x: 355, y, size: 10, font: bold });
  page.drawText("IVA", { x: 430, y, size: 10, font: bold });
  page.drawText("Total", { x: 500, y, size: 10, font: bold });
  y -= 16;

  page.drawText(voucher.notes?.trim() || "Comprobante local sin detalle de items (Fase 7)", {
    x: left,
    y,
    size: 10,
    font
  });
  page.drawText(money(Number(voucher.netAmount)), { x: 345, y, size: 10, font });
  page.drawText(money(Number(voucher.taxAmount)), { x: 420, y, size: 10, font });
  page.drawText(money(Number(voucher.totalAmount)), { x: 490, y, size: 10, font: bold });
  y -= 24;

  page.drawText(`Importe en letras: ${toWordsArs(Number(voucher.totalAmount))}`, {
    x: left,
    y,
    size: 10,
    font
  });
  y -= 20;

  if (voucher.letter === "B") {
    // RG 5614/2024: bloque de transparencia fiscal para consumidor.
    page.drawRectangle({
      x: left,
      y: y - 56,
      width: right - left,
      height: 56,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1
    });
    page.drawText("Regimen de Transparencia Fiscal al Consumidor - Ley 27.743", {
      x: left + 8,
      y: y - 16,
      size: 9,
      font: bold
    });
    page.drawText(`IVA contenido: ${money(Number(voucher.taxAmount))}`, {
      x: left + 8,
      y: y - 32,
      size: 9,
      font
    });
    page.drawText("Otros impuestos nacionales indirectos: 0,00", {
      x: left + 8,
      y: y - 46,
      size: 9,
      font
    });
    y -= 68;
  }

  page.drawRectangle({
    x: left,
    y: y - 100,
    width: 112,
    height: 100,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 1
  });
  page.drawText("QR ARCA", { x: left + 35, y: y - 18, size: 10, font: bold });
  page.drawText("Placeholder sin CAE", { x: left + 10, y: y - 36, size: 8, font });
  page.drawText("Se habilita en Fase 12", { x: left + 12, y: y - 48, size: 8, font });

  page.drawText("Payload QR preparado (AFIP/ARCA):", { x: left + 124, y: y - 16, size: 9, font });
  page.drawText(qrUrl, {
    x: left + 124,
    y: y - 30,
    size: 7,
    font: mono,
    color: rgb(0.2, 0.2, 0.2)
  });

  page.drawText("Documento local sin CAE. No valido como comprobante fiscal electronico.", {
    x: left + 124,
    y: y - 50,
    size: 9,
    font,
    color: rgb(0.45, 0.45, 0.45)
  });

  const bytes = await pdf.save();

  recordAuditEvent({
    studyId: tenant.company.studyId,
    userId: workspace.session.user.id,
    companyId: tenant.company.id,
    action: "voucher.pdf_generated",
    entity: "Voucher",
    entityId: voucher.id,
    metadata: {
      status: voucher.status,
      pointOfSale: voucher.pointOfSale,
      number: voucher.number ?? null
    }
  });

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="comprobante-${voucher.pointOfSale}-${voucher.number ?? "pendiente"}.pdf"`
    }
  });
}
