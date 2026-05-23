import { describe, expect, it } from "vitest";
import { getDemoMemberships, getDemoUser } from "./demo-data";
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
});
