CREATE TYPE "VoucherDirection" AS ENUM ('EMITIDO', 'RECIBIDO');
CREATE TYPE "VoucherType" AS ENUM ('FACTURA', 'NOTA_CREDITO', 'NOTA_DEBITO', 'RECIBO', 'OTRO');
CREATE TYPE "VoucherStatus" AS ENUM ('BORRADOR', 'REGISTRADO', 'ANULADO');

CREATE TABLE "Voucher" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "thirdPartyId" TEXT NOT NULL,
  "direction" "VoucherDirection" NOT NULL,
  "type" "VoucherType" NOT NULL,
  "letter" TEXT,
  "pointOfSale" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL,
  "dueDate" TIMESTAMP(3),
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "netAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "taxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "totalAmount" DECIMAL(18,2) NOT NULL,
  "status" "VoucherStatus" NOT NULL DEFAULT 'REGISTRADO',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Voucher_companyId_direction_type_letter_pointOfSale_number_key"
ON "Voucher"("companyId", "direction", "type", "letter", "pointOfSale", "number");

CREATE INDEX "Voucher_companyId_direction_issueDate_idx" ON "Voucher"("companyId", "direction", "issueDate");
CREATE INDEX "Voucher_companyId_thirdPartyId_idx" ON "Voucher"("companyId", "thirdPartyId");
CREATE INDEX "Voucher_companyId_status_idx" ON "Voucher"("companyId", "status");

ALTER TABLE "Voucher"
ADD CONSTRAINT "Voucher_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Voucher"
ADD CONSTRAINT "Voucher_thirdPartyId_fkey"
FOREIGN KEY ("thirdPartyId") REFERENCES "ThirdParty"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
