import "server-only";

import { prisma } from "@/lib/prisma";
import { demoCompanies, getDemoMemberships, getDemoUser } from "./demo-data";
import type { Company, Membership, PermissionSet, SessionContext, UserRole } from "./types";

function permissionsFromMembership(input: {
  role: UserRole;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canPostAccounting: boolean;
  canIssueInvoices: boolean;
  canReviewDocs: boolean;
}): PermissionSet {
  return {
    manageSettings: input.canManageSettings,
    manageUsers: input.canManageUsers,
    postAccounting: input.canPostAccounting,
    issueInvoices: input.canIssueInvoices,
    reviewDocuments: input.canReviewDocs,
    readReports: true,
    uploadDocuments: input.role !== "CONTADOR" ? true : true
  };
}

export async function getSessionFromDatabase(
  userId: string,
  activeCompanyId?: string
): Promise<SessionContext | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        active: true
      },
      include: {
        memberships: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        active: user.active
      },
      memberships: user.memberships.map((membership): Membership => ({
        userId: membership.userId,
        companyId: membership.companyId,
        role: membership.role,
        permissions: permissionsFromMembership(membership)
      })),
      activeCompanyId
    };
  } catch {
    return null;
  }
}

export async function listCompaniesFromDatabase(): Promise<Company[] | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        legalName: "asc"
      }
    });

    return companies.map((company) => ({
      id: company.id,
      legalName: company.legalName,
      tradeName: company.tradeName ?? undefined,
      cuit: company.cuit,
      taxCondition: company.taxCondition,
      status: company.status
    }));
  } catch {
    return null;
  }
}

export async function getWorkspaceData(userId: string, activeCompanyId?: string) {
  const session = await getSessionFromDatabase(userId, activeCompanyId);
  const companies = await listCompaniesFromDatabase();

  if (session && companies) {
    return {
      source: "database" as const,
      session,
      companies
    };
  }

  const fallbackUser = getDemoUser(userId) ?? getDemoUser("usr_contador");

  if (!fallbackUser) {
    throw new Error("No hay usuario fallback disponible.");
  }

  return {
    source: "demo" as const,
    session: {
      user: fallbackUser,
      memberships: getDemoMemberships(fallbackUser.id),
      activeCompanyId
    },
    companies: demoCompanies
  };
}
