-- CreateEnum
CREATE TYPE "StudyDocumentStatus" AS ENUM ('UPLOADED', 'PENDING_REVIEW', 'OBSERVED', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "StudyDocument" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "clientOfStudyId" TEXT,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "status" "StudyDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "createdByUserId" TEXT NOT NULL,
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyDocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyDocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyDocumentAccessLog" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyDocumentAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyDocument_studyId_status_createdAt_idx" ON "StudyDocument"("studyId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "StudyDocument_studyId_clientOfStudyId_status_idx" ON "StudyDocument"("studyId", "clientOfStudyId", "status");

-- CreateIndex
CREATE INDEX "StudyDocument_studyId_companyId_status_idx" ON "StudyDocument"("studyId", "companyId", "status");

-- CreateIndex
CREATE INDEX "StudyDocumentVersion_documentId_version_idx" ON "StudyDocumentVersion"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "StudyDocumentVersion_documentId_version_key" ON "StudyDocumentVersion"("documentId", "version");

-- CreateIndex
CREATE INDEX "StudyDocumentAccessLog_studyId_occurredAt_idx" ON "StudyDocumentAccessLog"("studyId", "occurredAt");

-- CreateIndex
CREATE INDEX "StudyDocumentAccessLog_documentId_occurredAt_idx" ON "StudyDocumentAccessLog"("documentId", "occurredAt");

-- CreateIndex
CREATE INDEX "StudyDocumentAccessLog_userId_occurredAt_idx" ON "StudyDocumentAccessLog"("userId", "occurredAt");

-- AddForeignKey
ALTER TABLE "StudyDocument" ADD CONSTRAINT "StudyDocument_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocument" ADD CONSTRAINT "StudyDocument_clientOfStudyId_fkey" FOREIGN KEY ("clientOfStudyId") REFERENCES "ClientOfStudy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocument" ADD CONSTRAINT "StudyDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocument" ADD CONSTRAINT "StudyDocument_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocument" ADD CONSTRAINT "StudyDocument_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocumentVersion" ADD CONSTRAINT "StudyDocumentVersion_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "StudyDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocumentVersion" ADD CONSTRAINT "StudyDocumentVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocumentAccessLog" ADD CONSTRAINT "StudyDocumentAccessLog_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocumentAccessLog" ADD CONSTRAINT "StudyDocumentAccessLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "StudyDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDocumentAccessLog" ADD CONSTRAINT "StudyDocumentAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

