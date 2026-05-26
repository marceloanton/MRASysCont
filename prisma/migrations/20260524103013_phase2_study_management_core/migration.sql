-- CreateEnum
CREATE TYPE "ClientStudyStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudyTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'WAITING_DOCUMENTATION', 'IN_REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StudyDeadlineStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'PRESENTED', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MonthlyStatusState" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'WAITING_DOCUMENTATION', 'IN_REVIEW', 'READY', 'CLOSED', 'OBSERVED');

-- AlterTable
ALTER TABLE "ClientOfStudy" ADD COLUMN     "status" "ClientStudyStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "ClientService" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "clientOfStudyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientInternalResponsible" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "clientOfStudyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientInternalResponsible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientMonthlyStatus" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "clientOfStudyId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" "MonthlyStatusState" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientMonthlyStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTask" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "clientOfStudyId" TEXT,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "StudyTaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "dueDate" TIMESTAMP(3),
    "assignedUserId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyDeadline" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "clientOfStudyId" TEXT NOT NULL,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "StudyDeadlineStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "assignedUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyDeadline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientService_studyId_clientOfStudyId_active_idx" ON "ClientService"("studyId", "clientOfStudyId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ClientService_studyId_clientOfStudyId_name_key" ON "ClientService"("studyId", "clientOfStudyId", "name");

-- CreateIndex
CREATE INDEX "ClientInternalResponsible_studyId_userId_active_idx" ON "ClientInternalResponsible"("studyId", "userId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ClientInternalResponsible_studyId_clientOfStudyId_key" ON "ClientInternalResponsible"("studyId", "clientOfStudyId");

-- CreateIndex
CREATE INDEX "ClientMonthlyStatus_studyId_period_status_idx" ON "ClientMonthlyStatus"("studyId", "period", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ClientMonthlyStatus_studyId_clientOfStudyId_period_key" ON "ClientMonthlyStatus"("studyId", "clientOfStudyId", "period");

-- CreateIndex
CREATE INDEX "StudyTask_studyId_status_dueDate_idx" ON "StudyTask"("studyId", "status", "dueDate");

-- CreateIndex
CREATE INDEX "StudyTask_studyId_assignedUserId_status_idx" ON "StudyTask"("studyId", "assignedUserId", "status");

-- CreateIndex
CREATE INDEX "StudyDeadline_studyId_dueDate_status_idx" ON "StudyDeadline"("studyId", "dueDate", "status");

-- CreateIndex
CREATE INDEX "StudyDeadline_studyId_clientOfStudyId_status_idx" ON "StudyDeadline"("studyId", "clientOfStudyId", "status");

-- AddForeignKey
ALTER TABLE "ClientService" ADD CONSTRAINT "ClientService_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientService" ADD CONSTRAINT "ClientService_clientOfStudyId_fkey" FOREIGN KEY ("clientOfStudyId") REFERENCES "ClientOfStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInternalResponsible" ADD CONSTRAINT "ClientInternalResponsible_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInternalResponsible" ADD CONSTRAINT "ClientInternalResponsible_clientOfStudyId_fkey" FOREIGN KEY ("clientOfStudyId") REFERENCES "ClientOfStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInternalResponsible" ADD CONSTRAINT "ClientInternalResponsible_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMonthlyStatus" ADD CONSTRAINT "ClientMonthlyStatus_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMonthlyStatus" ADD CONSTRAINT "ClientMonthlyStatus_clientOfStudyId_fkey" FOREIGN KEY ("clientOfStudyId") REFERENCES "ClientOfStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientMonthlyStatus" ADD CONSTRAINT "ClientMonthlyStatus_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_clientOfStudyId_fkey" FOREIGN KEY ("clientOfStudyId") REFERENCES "ClientOfStudy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDeadline" ADD CONSTRAINT "StudyDeadline_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "Study"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDeadline" ADD CONSTRAINT "StudyDeadline_clientOfStudyId_fkey" FOREIGN KEY ("clientOfStudyId") REFERENCES "ClientOfStudy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDeadline" ADD CONSTRAINT "StudyDeadline_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyDeadline" ADD CONSTRAINT "StudyDeadline_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
