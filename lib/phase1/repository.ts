import "server-only";

import { prisma } from "@/lib/prisma";
import { permissionsForRole } from "./permissions";
import { demoCompanies, demoMemberships, demoUsers, getDemoMemberships, getDemoUser } from "./demo-data";
import { hashPassword, verifyPassword } from "./password";
import type { Company, Membership, PermissionSet, SessionContext, User, UserRole } from "./types";

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

export async function listUsers() {
  if (!process.env.DATABASE_URL) {
    return {
      source: "demo" as const,
      users: demoUsers
    };
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc"
      }
    });

    return {
      source: "database" as const,
      users: users.map((user): User => ({
        id: user.id,
        email: user.email,
        name: user.name,
        active: user.active
      }))
    };
  } catch {
    return {
      source: "demo" as const,
      users: demoUsers
    };
  }
}

export async function listMemberships() {
  if (!process.env.DATABASE_URL) {
    return {
      source: "demo" as const,
      memberships: demoMemberships
    };
  }

  try {
    const memberships = await prisma.userCompany.findMany({
      orderBy: {
        createdAt: "asc"
      }
    });

    return {
      source: "database" as const,
      memberships: memberships.map((membership): Membership => ({
        userId: membership.userId,
        companyId: membership.companyId,
        role: membership.role,
        permissions: permissionsFromMembership(membership)
      }))
    };
  } catch {
    return {
      source: "demo" as const,
      memberships: demoMemberships
    };
  }
}

export async function createCompany(input: {
  legalName: string;
  tradeName?: string;
  cuit: string;
  taxCondition: string;
}) {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "Para crear empresas hace falta PostgreSQL configurado."
    };
  }

  try {
    const company = await prisma.company.create({
      data: {
        legalName: input.legalName,
        tradeName: input.tradeName || null,
        cuit: input.cuit,
        taxCondition: input.taxCondition,
        status: "ACTIVA"
      }
    });

    return {
      ok: true,
      message: "Empresa creada.",
      companyId: company.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear la empresa. Revisar CUIT duplicado o conexion."
    };
  }
}

export async function createUserWithMembership(input: {
  name: string;
  email: string;
  password: string;
  companyId: string;
  role: UserRole;
}) {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "Para crear usuarios hace falta PostgreSQL configurado."
    };
  }

  const permissions = permissionsForRole(input.role);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: hashPassword(input.password),
        active: true,
        memberships: {
          create: {
            companyId: input.companyId,
            role: input.role,
            canManageSettings: permissions.manageSettings,
            canManageUsers: permissions.manageUsers,
            canPostAccounting: permissions.postAccounting,
            canIssueInvoices: permissions.issueInvoices,
            canReviewDocs: permissions.reviewDocuments
          }
        }
      }
    });

    return {
      ok: true,
      message: "Usuario creado.",
      userId: user.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear el usuario. Revisar email duplicado o conexion."
    };
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
