import { PrismaClient } from "@prisma/client";
import {
  demoCompanies,
  demoMemberships,
  demoStudies,
  demoUsers
} from "../lib/phase1/demo-data";
import { hashPassword } from "../lib/phase1/password";

const prisma = new PrismaClient();
const seedPassword = process.env.SEED_USER_PASSWORD ?? "MraSysCont2026!";

async function main() {
  for (const study of demoStudies) {
    await prisma.study.upsert({
      where: { id: study.id },
      create: study,
      update: study
    });
  }

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        active: user.active,
        passwordHash: hashPassword(seedPassword)
      },
      update: {
        email: user.email,
        name: user.name,
        active: user.active,
        passwordHash: hashPassword(seedPassword)
      }
    });
  }

  for (const company of demoCompanies) {
    await prisma.company.upsert({
      where: { id: company.id },
      create: company,
      update: company
    });
  }

  for (const membership of demoMemberships) {
    await prisma.userCompany.upsert({
      where: {
        studyId_userId_companyId: {
          studyId: membership.studyId,
          userId: membership.userId,
          companyId: membership.companyId
        }
      },
      create: {
        studyId: membership.studyId,
        userId: membership.userId,
        companyId: membership.companyId,
        role: membership.role,
        canManageSettings: membership.permissions.manageSettings,
        canManageUsers: membership.permissions.manageUsers,
        canPostAccounting: membership.permissions.postAccounting,
        canIssueInvoices: membership.permissions.issueInvoices,
        canReviewDocs: membership.permissions.reviewDocuments
      },
      update: {
        role: membership.role,
        canManageSettings: membership.permissions.manageSettings,
        canManageUsers: membership.permissions.manageUsers,
        canPostAccounting: membership.permissions.postAccounting,
        canIssueInvoices: membership.permissions.issueInvoices,
        canReviewDocs: membership.permissions.reviewDocuments
      }
    });

    await prisma.studyMembership.upsert({
      where: {
        studyId_userId: {
          studyId: membership.studyId,
          userId: membership.userId
        }
      },
      create: {
        studyId: membership.studyId,
        userId: membership.userId,
        role: membership.role,
        status: "ACTIVE"
      },
      update: {
        role: membership.role,
        status: "ACTIVE"
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
