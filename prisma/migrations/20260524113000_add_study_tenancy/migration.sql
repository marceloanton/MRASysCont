-- 1) Enum for study membership lifecycle
CREATE TYPE "StudyMembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- 2) Core study tables
CREATE TABLE "Study" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Study_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Study_slug_key" ON "Study"("slug");

CREATE TABLE "StudyMembership" (
  "id" TEXT NOT NULL,
  "studyId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "status" "StudyMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudyMembership_studyId_userId_key" ON "StudyMembership"("studyId", "userId");
CREATE INDEX "StudyMembership_userId_status_idx" ON "StudyMembership"("userId", "status");

CREATE TABLE "ClientOfStudy" (
  "id" TEXT NOT NULL,
  "studyId" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "cuit" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ClientOfStudy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClientOfStudy_studyId_legalName_key" ON "ClientOfStudy"("studyId", "legalName");
CREATE INDEX "ClientOfStudy_studyId_active_idx" ON "ClientOfStudy"("studyId", "active");

-- 3) Add study columns to phase-1 core entities
ALTER TABLE "Company" ADD COLUMN "studyId" TEXT;
ALTER TABLE "Company" ADD COLUMN "clientOfStudyId" TEXT;
ALTER TABLE "UserCompany" ADD COLUMN "studyId" TEXT;
ALTER TABLE "Session" ADD COLUMN "activeStudyId" TEXT;

-- 4) Add study columns to operational entities (nullable in this migration)
ALTER TABLE "AccountingPeriod" ADD COLUMN "studyId" TEXT;
ALTER TABLE "Account" ADD COLUMN "studyId" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN "studyId" TEXT;
ALTER TABLE "ThirdParty" ADD COLUMN "studyId" TEXT;
ALTER TABLE "Voucher" ADD COLUMN "studyId" TEXT;
ALTER TABLE "VoucherSequence" ADD COLUMN "studyId" TEXT;
ALTER TABLE "Settlement" ADD COLUMN "studyId" TEXT;
ALTER TABLE "TreasuryAccount" ADD COLUMN "studyId" TEXT;
ALTER TABLE "TreasuryMovement" ADD COLUMN "studyId" TEXT;
ALTER TABLE "AuditEvent" ADD COLUMN "studyId" TEXT;

-- 5) Backfill default study and tenant assignments
INSERT INTO "Study" ("id", "name", "slug", "active", "createdAt", "updatedAt")
VALUES ('std_default', 'Default Study', 'default-study', true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

UPDATE "Company"
SET "studyId" = 'std_default'
WHERE "studyId" IS NULL;

ALTER TABLE "Company"
ALTER COLUMN "studyId" SET NOT NULL;

UPDATE "UserCompany" uc
SET "studyId" = c."studyId"
FROM "Company" c
WHERE uc."companyId" = c."id"
  AND uc."studyId" IS NULL;

ALTER TABLE "UserCompany"
ALTER COLUMN "studyId" SET NOT NULL;

UPDATE "Session" s
SET "activeStudyId" = c."studyId"
FROM "Company" c
WHERE s."activeCompanyId" = c."id"
  AND s."activeStudyId" IS NULL;

-- Backfill operational rows from company
UPDATE "AccountingPeriod" p SET "studyId" = c."studyId" FROM "Company" c WHERE p."companyId" = c."id" AND p."studyId" IS NULL;
UPDATE "Account" a SET "studyId" = c."studyId" FROM "Company" c WHERE a."companyId" = c."id" AND a."studyId" IS NULL;
UPDATE "JournalEntry" j SET "studyId" = c."studyId" FROM "Company" c WHERE j."companyId" = c."id" AND j."studyId" IS NULL;
UPDATE "ThirdParty" t SET "studyId" = c."studyId" FROM "Company" c WHERE t."companyId" = c."id" AND t."studyId" IS NULL;
UPDATE "Voucher" v SET "studyId" = c."studyId" FROM "Company" c WHERE v."companyId" = c."id" AND v."studyId" IS NULL;
UPDATE "VoucherSequence" vs SET "studyId" = c."studyId" FROM "Company" c WHERE vs."companyId" = c."id" AND vs."studyId" IS NULL;
UPDATE "Settlement" s SET "studyId" = c."studyId" FROM "Company" c WHERE s."companyId" = c."id" AND s."studyId" IS NULL;
UPDATE "TreasuryAccount" ta SET "studyId" = c."studyId" FROM "Company" c WHERE ta."companyId" = c."id" AND ta."studyId" IS NULL;
UPDATE "TreasuryMovement" tm SET "studyId" = c."studyId" FROM "Company" c WHERE tm."companyId" = c."id" AND tm."studyId" IS NULL;
UPDATE "AuditEvent" ae SET "studyId" = c."studyId" FROM "Company" c WHERE ae."companyId" = c."id" AND ae."studyId" IS NULL;

-- 6) Build phase-1 study memberships from existing user-company memberships
INSERT INTO "StudyMembership" ("id", "studyId", "userId", "role", "status", "createdAt", "updatedAt")
SELECT DISTINCT
  concat('sm_', md5(uc."studyId" || ':' || uc."userId")),
  uc."studyId",
  uc."userId",
  uc."role",
  'ACTIVE'::"StudyMembershipStatus",
  NOW(),
  NOW()
FROM "UserCompany" uc
ON CONFLICT ("studyId", "userId") DO NOTHING;

-- 7) Replace old uniqueness/index and add new indexes
DROP INDEX IF EXISTS "UserCompany_companyId_role_idx";
DROP INDEX IF EXISTS "UserCompany_userId_companyId_key";

CREATE UNIQUE INDEX "UserCompany_studyId_userId_companyId_key" ON "UserCompany"("studyId", "userId", "companyId");
CREATE INDEX "UserCompany_studyId_companyId_role_idx" ON "UserCompany"("studyId", "companyId", "role");

CREATE INDEX "Company_studyId_status_idx" ON "Company"("studyId", "status");
CREATE INDEX "Company_studyId_clientOfStudyId_idx" ON "Company"("studyId", "clientOfStudyId");

CREATE INDEX "Session_activeStudyId_idx" ON "Session"("activeStudyId");

CREATE INDEX "AccountingPeriod_studyId_companyId_status_idx" ON "AccountingPeriod"("studyId", "companyId", "status");
CREATE INDEX "Account_studyId_companyId_type_idx" ON "Account"("studyId", "companyId", "type");
CREATE INDEX "JournalEntry_studyId_companyId_date_idx" ON "JournalEntry"("studyId", "companyId", "date");
CREATE INDEX "ThirdParty_studyId_companyId_type_idx" ON "ThirdParty"("studyId", "companyId", "type");
CREATE INDEX "Voucher_studyId_companyId_status_idx" ON "Voucher"("studyId", "companyId", "status");
CREATE INDEX "VoucherSequence_studyId_companyId_pointOfSale_type_idx" ON "VoucherSequence"("studyId", "companyId", "pointOfSale", "type");
CREATE INDEX "Settlement_studyId_companyId_date_idx" ON "Settlement"("studyId", "companyId", "date");
CREATE INDEX "TreasuryAccount_studyId_companyId_type_idx" ON "TreasuryAccount"("studyId", "companyId", "type");
CREATE INDEX "TreasuryMovement_studyId_companyId_date_idx" ON "TreasuryMovement"("studyId", "companyId", "date");
CREATE INDEX "AuditEvent_studyId_occurredAt_idx" ON "AuditEvent"("studyId", "occurredAt");

-- 8) Foreign keys
ALTER TABLE "StudyMembership"
ADD CONSTRAINT "StudyMembership_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StudyMembership"
ADD CONSTRAINT "StudyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ClientOfStudy"
ADD CONSTRAINT "ClientOfStudy_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Company"
ADD CONSTRAINT "Company_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Company"
ADD CONSTRAINT "Company_clientOfStudyId_fkey" FOREIGN KEY ("clientOfStudyId") REFERENCES "ClientOfStudy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "UserCompany"
ADD CONSTRAINT "UserCompany_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Session"
ADD CONSTRAINT "Session_activeStudyId_fkey" FOREIGN KEY ("activeStudyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ThirdParty" ADD CONSTRAINT "ThirdParty_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoucherSequence" ADD CONSTRAINT "VoucherSequence_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TreasuryAccount" ADD CONSTRAINT "TreasuryAccount_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE SET NULL ON UPDATE CASCADE;
