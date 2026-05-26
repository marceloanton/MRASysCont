import { describe, expect, it } from "vitest";
import { demoCompanies, getDemoMemberships, getDemoUser } from "./demo-data";
import { assertCompanyAccess, getAllowedCompanyIds } from "./tenant-access";
import type { SessionContext } from "./types";

function demoSession(userId: string, activeCompanyId?: string): SessionContext {
  const user = getDemoUser(userId);

  if (!user) {
    throw new Error(`Missing demo user ${userId}`);
  }

  return {
    user,
    memberships: getDemoMemberships(user.id),
    activeStudyId: "std_default",
    activeCompanyId
  };
}

describe("tenant access", () => {
  it("allows contador to access every assigned company", () => {
    const session = demoSession("usr_contador");
    const allowedCompanyIds = getAllowedCompanyIds(session);

    expect(allowedCompanyIds.has("emp_alfa")).toBe(true);
    expect(allowedCompanyIds.has("emp_beta")).toBe(true);
    expect(allowedCompanyIds.has("emp_gamma")).toBe(true);
  });

  it("blocks assistant from accessing an unassigned company", () => {
    const session = demoSession("usr_asistente");

    expect(() => assertCompanyAccess(session, "emp_gamma")).toThrow(
      "El usuario no tiene acceso a esta empresa."
    );
  });

  it("blocks client from posting accounting", () => {
    const session = demoSession("usr_cliente");

    expect(() =>
      assertCompanyAccess(session, "emp_gamma", "postAccounting")
    ).toThrow("El usuario no tiene permiso para esta accion.");
  });

  it("allows client to upload documents for its own company", () => {
    const session = demoSession("usr_cliente");
    const access = assertCompanyAccess(session, "emp_gamma", "uploadDocuments");

    expect(access.company.id).toBe("emp_gamma");
    expect(access.membership.role).toBe("CLIENTE");
  });

  it("user_from_study_a_cannot_access_study_b", () => {
    const session = demoSession("usr_contador");
    const foreignCompany = {
      ...demoCompanies[0],
      id: "emp_foreign",
      studyId: "std_other"
    };

    expect(() =>
      assertCompanyAccess(session, foreignCompany.id)
    ).toThrow("El usuario no tiene acceso a esta empresa.");
  });

  it("company_requires_study_id", () => {
    const company = demoCompanies.find((item) => item.id === "emp_alfa");
    expect(company?.studyId).toBeTruthy();
  });

  it("user_company_assignment_requires_same_study", () => {
    const session: SessionContext = {
      user: getDemoUser("usr_contador")!,
      memberships: [
        {
          ...getDemoMemberships("usr_contador")[0],
          studyId: "std_default",
          companyId: "emp_alfa"
        }
      ],
      activeStudyId: "std_other",
      activeCompanyId: "emp_alfa"
    };

    expect(() => assertCompanyAccess(session, "emp_alfa")).toThrow(
      "La empresa no pertenece al estudio activo."
    );
  });

  it("cannot_select_company_from_other_study", () => {
    const session: SessionContext = {
      user: getDemoUser("usr_contador")!,
      memberships: getDemoMemberships("usr_contador"),
      activeStudyId: "std_other",
      activeCompanyId: "emp_alfa"
    };

    expect(() => assertCompanyAccess(session, "emp_alfa")).toThrow(
      "La empresa no pertenece al estudio activo."
    );
  });

  it("active_company_must_belong_to_active_study", () => {
    const session: SessionContext = {
      user: getDemoUser("usr_contador")!,
      memberships: [
        {
          ...getDemoMemberships("usr_contador")[0],
          studyId: "std_default",
          companyId: "emp_alfa"
        }
      ],
      activeStudyId: "std_default",
      activeCompanyId: "emp_alfa"
    };

    const access = assertCompanyAccess(session, "emp_alfa");
    expect(access.company.studyId).toBe(session.activeStudyId);
  });

  it("existing_data_migrates_to_default_study", () => {
    const memberships = getDemoMemberships("usr_contador");
    expect(memberships.every((membership) => membership.studyId === "std_default")).toBe(
      true
    );
  });

  it("inactive_study_membership_blocks_company_access", () => {
    const baseSession = demoSession("usr_contador");
    const session = {
      ...baseSession,
      memberships: [
        {
          ...baseSession.memberships[0],
          studyMembershipStatus: "SUSPENDED" as const
        }
      ]
    };

    expect(() => assertCompanyAccess(session, "emp_alfa")).toThrow(
      "La membresia del estudio no esta activa."
    );
  });
});
