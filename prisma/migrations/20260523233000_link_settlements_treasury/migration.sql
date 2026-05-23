ALTER TABLE "Settlement"
ADD COLUMN "treasuryAccountId" TEXT,
ADD COLUMN "treasuryMovementId" TEXT;

CREATE INDEX "Settlement_companyId_treasuryAccountId_idx" ON "Settlement"("companyId", "treasuryAccountId");
CREATE UNIQUE INDEX "Settlement_treasuryMovementId_key" ON "Settlement"("treasuryMovementId");

ALTER TABLE "Settlement"
ADD CONSTRAINT "Settlement_treasuryAccountId_fkey"
FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Settlement"
ADD CONSTRAINT "Settlement_treasuryMovementId_fkey"
FOREIGN KEY ("treasuryMovementId") REFERENCES "TreasuryMovement"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
