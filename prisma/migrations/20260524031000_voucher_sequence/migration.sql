CREATE TABLE "VoucherSequence" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "pointOfSale" TEXT NOT NULL,
  "type" "VoucherType" NOT NULL,
  "lastNumber" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VoucherSequence_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VoucherSequence_companyId_pointOfSale_type_key"
ON "VoucherSequence"("companyId", "pointOfSale", "type");

CREATE INDEX "VoucherSequence_companyId_pointOfSale_type_idx"
ON "VoucherSequence"("companyId", "pointOfSale", "type");

ALTER TABLE "VoucherSequence"
ADD CONSTRAINT "VoucherSequence_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;