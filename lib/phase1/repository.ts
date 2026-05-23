import "server-only";

import { prisma } from "@/lib/prisma";
import { demoCompanies, getDemoMemberships, getDemoUser } from "./demo-data";
import { verifyPassword } from "./password";
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

export async function authenticateUser(email: string, password: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user?.active || !user.passwordHash) {
      return null;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function createDatabaseSession(userId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    return await prisma.session.create({
      data: {
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12)
      }
    });
  } catch {
    return null;
  }
}

export async function deleteDatabaseSession(sessionId: string) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.session.delete({
      where: {
        id: sessionId
      }
    });
  } catch {
    // Session may already be gone; logout should stay idempotent.
  }
}

export async function updateSessionCompany(sessionId: string, companyId: string) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.session.update({
      where: {
        id: sessionId
      },
      data: {
        activeCompanyId: companyId
      }
    });
  } catch {
    // Fallback cookie still keeps the active company in development.
  }
}

export async function getWorkspaceBySessionId(sessionId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: {
        id: sessionId
      }
    });

    if (!session || session.expiresAt <= new Date()) {
      return null;
    }

    return getWorkspaceData(session.userId, session.activeCompanyId ?? undefined);
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
