import { PrismaClient } from "@prisma/client";
import { demoCompanies, demoMemberships, demoUsers } from "../lib/phase1/demo-data";
import { hashPassword } from "../lib/phase1/password";

const prisma = new PrismaClient();
const seedPassword = process.env.SEED_USER_PASSWORD ?? "MraSysCont2026!";

async function main() {
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
        userId_companyId: {
          userId: membership.userId,
          companyId: membership.companyId
        }
      },
      create: {
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
