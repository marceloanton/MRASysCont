ALTER TABLE "TreasuryMovement"
ADD COLUMN "reconciled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reconciledAt" TIMESTAMP(3),
ADD COLUMN "reconciliationReference" TEXT;

CREATE INDEX "TreasuryMovement_companyId_reconciled_idx" ON "TreasuryMovement"("companyId", "reconciled");
