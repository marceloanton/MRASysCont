ALTER TABLE "JournalEntry"
ADD COLUMN "reversalOfEntryId" TEXT,
ADD COLUMN "reversedByEntryId" TEXT,
ADD COLUMN "reversalReason" TEXT;

CREATE INDEX "JournalEntry_reversalOfEntryId_idx" ON "JournalEntry"("reversalOfEntryId");
CREATE INDEX "JournalEntry_reversedByEntryId_idx" ON "JournalEntry"("reversedByEntryId");

ALTER TABLE "JournalEntry"
ADD CONSTRAINT "JournalEntry_reversalOfEntryId_fkey"
FOREIGN KEY ("reversalOfEntryId") REFERENCES "JournalEntry"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "JournalEntry"
ADD CONSTRAINT "JournalEntry_reversedByEntryId_fkey"
FOREIGN KEY ("reversedByEntryId") REFERENCES "JournalEntry"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
