import "server-only";

import { prisma } from "@/lib/prisma";
import { permissionsForRole } from "./permissions";
import {
  demoCompanies,
  demoMemberships,
  demoStudies,
  demoUsers,
  getDemoMemberships,
  getDemoUser
} from "./demo-data";
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
  activeStudyId?: string,
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
        memberships: true,
        studyMemberships: {
          where: {
            status: "ACTIVE",
            study: {
              active: true
            }
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    const activeStudyIds = new Set(
      user.studyMemberships.map((membership) => membership.studyId)
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        active: user.active
      },
      memberships: user.memberships
        .filter((membership) => activeStudyIds.has(membership.studyId))
        .map((membership): Membership => ({
          studyId: membership.studyId,
          userId: membership.userId,
          companyId: membership.companyId,
          role: membership.role,
          studyMembershipStatus: "ACTIVE",
          permissions: permissionsFromMembership(membership)
        })),
      activeStudyId,
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

export async function createDatabaseSession(
  userId: string,
  activeStudyId?: string,
  activeCompanyId?: string
) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    if (!activeStudyId || !activeCompanyId) {
      const firstMembership = await prisma.userCompany.findFirst({
        where: {
          userId
        },
        orderBy: {
          createdAt: "asc"
        }
      });

      if (firstMembership) {
        activeStudyId = activeStudyId ?? firstMembership.studyId;
        activeCompanyId = activeCompanyId ?? firstMembership.companyId;
      }
    }

    return await prisma.session.create({
      data: {
        userId,
        activeStudyId,
        activeCompanyId,
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

export async function updateSessionTenant(
  sessionId: string,
  studyId: string,
  companyId: string
) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await prisma.session.update({
      where: {
        id: sessionId
      },
      data: {
        activeStudyId: studyId,
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

    return getWorkspaceData(
      session.userId,
      session.activeStudyId ?? undefined,
      session.activeCompanyId ?? undefined
    );
  } catch {
    return null;
  }
}

export async function listCompaniesFromDatabase(
  studyId?: string
): Promise<Company[] | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const companies = await prisma.company.findMany({
      where: studyId
        ? {
            studyId
          }
        : undefined,
      orderBy: {
        legalName: "asc"
      }
    });

    return companies.map((company) => ({
      id: company.id,
      studyId: company.studyId,
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

export async function listUsers(studyId: string) {
  if (!process.env.DATABASE_URL) {
    return {
      source: "demo" as const,
      users: demoUsers
    };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        studyMemberships: {
          some: {
            studyId,
            status: "ACTIVE"
          }
        }
      },
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

export async function listMemberships(studyId: string) {
  if (!process.env.DATABASE_URL) {
    return {
      source: "demo" as const,
      memberships: demoMemberships
    };
  }

  try {
    const memberships = await prisma.userCompany.findMany({
      where: {
        studyId
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return {
      source: "database" as const,
      memberships: memberships.map((membership): Membership => ({
        studyId: membership.studyId,
        userId: membership.userId,
        companyId: membership.companyId,
        role: membership.role,
        studyMembershipStatus: "ACTIVE",
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
  studyId: string;
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
        studyId: input.studyId,
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
  studyId: string;
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
    const company = await prisma.company.findFirst({
      where: {
        id: input.companyId,
        studyId: input.studyId
      },
      select: {
        id: true
      }
    });

    if (!company) {
      return {
        ok: false,
        message: "La empresa no pertenece al estudio activo."
      };
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: hashPassword(input.password),
        active: true,
        memberships: {
          create: {
            studyId: input.studyId,
            companyId: input.companyId,
            role: input.role,
            canManageSettings: permissions.manageSettings,
            canManageUsers: permissions.manageUsers,
            canPostAccounting: permissions.postAccounting,
            canIssueInvoices: permissions.issueInvoices,
            canReviewDocs: permissions.reviewDocuments
          }
        },
        studyMemberships: {
          create: {
            studyId: input.studyId,
            role: input.role,
            status: "ACTIVE"
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

export async function assignUserCompany(input: {
  studyId: string;
  userId: string;
  companyId: string;
  role: UserRole;
}) {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "Para asignar usuarios hace falta PostgreSQL configurado."
    };
  }

  const permissions = permissionsForRole(input.role);

  try {
    const [user, company] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: input.userId
        },
        select: {
          id: true,
          active: true
        }
      }),
      prisma.company.findFirst({
        where: {
          id: input.companyId,
          studyId: input.studyId
        },
        select: {
          id: true
        }
      })
    ]);

    if (!user || !user.active) {
      return {
        ok: false,
        message: "El usuario no existe o esta inactivo."
      };
    }

    if (!company) {
      return {
        ok: false,
        message: "La empresa no pertenece al estudio activo."
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.studyMembership.upsert({
        where: {
          studyId_userId: {
            studyId: input.studyId,
            userId: input.userId
          }
        },
        update: {
          role: input.role,
          status: "ACTIVE"
        },
        create: {
          studyId: input.studyId,
          userId: input.userId,
          role: input.role,
          status: "ACTIVE"
        }
      });

      await tx.userCompany.upsert({
        where: {
          studyId_userId_companyId: {
            studyId: input.studyId,
            userId: input.userId,
            companyId: input.companyId
          }
        },
        update: {
          role: input.role,
          canManageSettings: permissions.manageSettings,
          canManageUsers: permissions.manageUsers,
          canPostAccounting: permissions.postAccounting,
          canIssueInvoices: permissions.issueInvoices,
          canReviewDocs: permissions.reviewDocuments
        },
        create: {
          studyId: input.studyId,
          userId: input.userId,
          companyId: input.companyId,
          role: input.role,
          canManageSettings: permissions.manageSettings,
          canManageUsers: permissions.manageUsers,
          canPostAccounting: permissions.postAccounting,
          canIssueInvoices: permissions.issueInvoices,
          canReviewDocs: permissions.reviewDocuments
        }
      });
    });

    return {
      ok: true,
      message: "Asignacion creada o actualizada."
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo asignar usuario a empresa."
    };
  }
}

export async function listStudiesForUser(userId: string) {
  if (!process.env.DATABASE_URL) {
    const studyIds = new Set(getDemoMemberships(userId).map((membership) => membership.studyId));
    return {
      source: "demo" as const,
      studies: demoStudies.filter((study) => studyIds.has(study.id))
    };
  }

  try {
    const memberships = await prisma.studyMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        study: {
          active: true
        }
      },
      select: {
        study: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        study: {
          name: "asc"
        }
      }
    });

    return {
      source: "database" as const,
      studies: memberships.map((membership) => membership.study)
    };
  } catch {
    return {
      source: "demo" as const,
      studies: []
    };
  }
}

export async function createStudy(input: { name: string; slug: string }) {
  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "Para crear estudios hace falta PostgreSQL configurado."
    };
  }

  try {
    const study = await prisma.study.create({
      data: {
        name: input.name,
        slug: input.slug,
        active: true
      }
    });

    return {
      ok: true,
      message: "Estudio creado.",
      studyId: study.id
    };
  } catch {
    return {
      ok: false,
      message: "No se pudo crear el estudio. Revisar slug duplicado."
    };
  }
}

export async function getWorkspaceData(
  userId: string,
  activeStudyId?: string,
  activeCompanyId?: string
) {
  const session = await getSessionFromDatabase(userId, activeStudyId, activeCompanyId);
  const resolvedActiveStudyId = session
    ? session.activeStudyId ?? session.memberships.at(0)?.studyId
    : undefined;
  const companies = await listCompaniesFromDatabase(resolvedActiveStudyId);

  if (session && companies && resolvedActiveStudyId) {
    return {
      source: "database" as const,
      session: {
        ...session,
        activeStudyId: resolvedActiveStudyId
      },
      companies
    };
  }

  const fallbackUser = getDemoUser(userId) ?? getDemoUser("usr_contador");

  if (!fallbackUser) {
    throw new Error("No hay usuario fallback disponible.");
  }

  const demoMembershipsForUser = getDemoMemberships(fallbackUser.id);
  const resolvedStudyId = activeStudyId ?? demoMembershipsForUser.at(0)?.studyId;
  const scopedCompanies = demoCompanies.filter((company) => company.studyId === resolvedStudyId);

  return {
    source: "demo" as const,
    session: {
      user: fallbackUser,
      memberships: demoMembershipsForUser,
      activeStudyId: resolvedStudyId,
      activeCompanyId
    },
    companies: scopedCompanies
  };
}
