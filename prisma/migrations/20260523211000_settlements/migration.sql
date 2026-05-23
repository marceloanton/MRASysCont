CREATE TYPE "SettlementDirection" AS ENUM ('COBRO', 'PAGO');

CREATE TABLE "Settlement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "thirdPartyId" TEXT NOT NULL,
  "direction" "SettlementDirection" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "amount" DECIMAL(18,2) NOT NULL,
  "method" TEXT NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Settlement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Settlement_companyId_thirdPartyId_idx" ON "Settlement"("companyId", "thirdPartyId");
CREATE INDEX "Settlement_companyId_direction_date_idx" ON "Settlement"("companyId", "direction", "date");

ALTER TABLE "Settlement"
ADD CONSTRAINT "Settlement_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Settlement"
ADD CONSTRAINT "Settlement_thirdPartyId_fkey"
FOREIGN KEY ("thirdPartyId") REFERENCES "ThirdParty"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
