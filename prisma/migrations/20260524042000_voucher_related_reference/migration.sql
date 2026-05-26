ALTER TABLE "Voucher"
ADD COLUMN "relatedVoucherId" TEXT;

CREATE INDEX "Voucher_relatedVoucherId_idx" ON "Voucher"("relatedVoucherId");

ALTER TABLE "Voucher"
ADD CONSTRAINT "Voucher_relatedVoucherId_fkey"
FOREIGN KEY ("relatedVoucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;