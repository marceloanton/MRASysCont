CREATE TYPE "TreasuryAccountType" AS ENUM ('CAJA', 'BANCO', 'BILLETERA');
CREATE TYPE "TreasuryMovementType" AS ENUM ('INGRESO', 'EGRESO', 'TRANSFERENCIA', 'AJUSTE');

CREATE TABLE "TreasuryAccount" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "type" "TreasuryAccountType" NOT NULL,
  "name" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "bankName" TEXT,
  "accountNumber" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TreasuryAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TreasuryMovement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "treasuryAccountId" TEXT NOT NULL,
  "type" "TreasuryMovementType" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ARS',
  "amount" DECIMAL(18,2) NOT NULL,
  "description" TEXT NOT NULL,
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "TreasuryMovement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TreasuryAccount_companyId_name_key" ON "TreasuryAccount"("companyId", "name");
CREATE INDEX "TreasuryAccount_companyId_type_idx" ON "TreasuryAccount"("companyId", "type");
CREATE INDEX "TreasuryAccount_companyId_active_idx" ON "TreasuryAccount"("companyId", "active");
CREATE INDEX "TreasuryMovement_companyId_date_idx" ON "TreasuryMovement"("companyId", "date");
CREATE INDEX "TreasuryMovement_companyId_treasuryAccountId_idx" ON "TreasuryMovement"("companyId", "treasuryAccountId");
CREATE INDEX "TreasuryMovement_companyId_type_idx" ON "TreasuryMovement"("companyId", "type");

ALTER TABLE "TreasuryAccount"
ADD CONSTRAINT "TreasuryAccount_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TreasuryMovement"
ADD CONSTRAINT "TreasuryMovement_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "Company"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TreasuryMovement"
ADD CONSTRAINT "TreasuryMovement_treasuryAccountId_fkey"
FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
