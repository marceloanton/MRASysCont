-- Link vouchers with proposed accounting journal entries (1:1 optional)
ALTER TABLE "Voucher"
ADD COLUMN "journalEntryId" TEXT;

CREATE UNIQUE INDEX "Voucher_journalEntryId_key" ON "Voucher"("journalEntryId");

ALTER TABLE "Voucher"
ADD CONSTRAINT "Voucher_journalEntryId_fkey"
FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;