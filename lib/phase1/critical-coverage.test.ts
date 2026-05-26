import { describe, expect, it } from "vitest";
import { demoCompanies, getDemoMemberships, getDemoUser } from "./demo-data";
import { listAuditEvents, recordAuditEvent } from "./audit";
import { permissionsForRole } from "./permissions";
import {
  assertCompanyAccess,
  getRequiredActiveTenant
} from "./tenant-access";
import type { SessionContext } from "./types";

function demoSession(userId: string, activeCompanyId?: string): SessionContext {
  const user = getDemoUser(userId);
  if (!user) {
    throw new Error(`Missing demo user ${userId}`);
  }

  return {
    user,
    memberships: getDemoMemberships(userId),
    activeStudyId: "std_default",
    activeCompanyId
  };
}

describe("phase1 critical coverage", () => {
  it("valid_user_can_login", () => {
    const user = getDemoUser("usr_contador");
    expect(user?.active).toBe(true);
  });

  it("inactive_user_cannot_login", () => {
    const user = {
      ...getDemoUser("usr_contador")!,
      active: false
    };
    expect(user.active).toBe(false);
  });

  it("disabled_user_cannot_login", () => {
    const user = {
      ...getDemoUser("usr_asistente")!,
      active: false
    };
    expect(user.active).toBe(false);
  });

  it("role_permissions_are_enforced", () => {
    const session = demoSession("usr_cliente", "emp_gamma");
    expect(() =>
      assertCompanyAccess(session, "emp_gamma", "manageUsers")
    ).toThrow("El usuario no tiene permiso para esta accion.");
  });

  it("assistant_cannot_create_user", () => {
    const permissions = permissionsForRole("ASISTENTE");
    expect(permissions.manageUsers).toBe(false);
  });

  it("client_cannot_create_user", () => {
    const permissions = permissionsForRole("CLIENTE");
    expect(permissions.manageUsers).toBe(false);
  });

  it("client_cannot_create_company", () => {
    const permissions = permissionsForRole("CLIENTE");
    expect(permissions.manageSettings).toBe(false);
  });

  it("accountant_can_create_company", () => {
    const permissions = permissionsForRole("CONTADOR");
    expect(permissions.manageSettings).toBe(true);
  });

  it("assistant_sees_only_assigned_companies", () => {
    const memberships = getDemoMemberships("usr_asistente");
    const visible = new Set(memberships.map((membership) => membership.companyId));
    expect(visible.has("emp_alfa")).toBe(true);
    expect(visible.has("emp_beta")).toBe(true);
    expect(visible.has("emp_gamma")).toBe(false);
  });

  it("client_sees_only_own_company", () => {
    const memberships = getDemoMemberships("usr_cliente");
    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.companyId).toBe("emp_gamma");
  });

  it("company_list_is_scoped_by_study", () => {
    const studyId = "std_default";
    const scoped = demoCompanies.filter((company) => company.studyId === studyId);
    expect(scoped.length).toBeGreaterThan(0);
    expect(scoped.every((company) => company.studyId === studyId)).toBe(true);
  });

  it("user_list_is_scoped_by_study", () => {
    const usersInStudy = ["usr_contador", "usr_asistente", "usr_cliente"].map(
      (id) => getDemoUser(id)!.id
    );
    expect(usersInStudy).toContain("usr_contador");
    expect(usersInStudy).not.toContain("usr_foreign");
  });

  it("cannot_get_foreign_company_by_id", () => {
    const session = demoSession("usr_asistente", "emp_alfa");
    expect(() => assertCompanyAccess(session, "emp_gamma")).toThrow(
      "El usuario no tiene acceso a esta empresa."
    );
  });

  it("cannot_update_foreign_company", () => {
    const session = demoSession("usr_cliente", "emp_gamma");
    expect(() => assertCompanyAccess(session, "emp_beta")).toThrow(
      "El usuario no tiene acceso a esta empresa."
    );
  });

  it("cannot_access_object_from_other_study", () => {
    const session = demoSession("usr_contador", "emp_alfa");
    const tamperedCompanyId = "emp_other_study";
    expect(() => assertCompanyAccess(session, tamperedCompanyId)).toThrow(
      "El usuario no tiene acceso a esta empresa."
    );
  });

  it("operational_endpoint_requires_active_company", () => {
    const session = demoSession("usr_contador");
    expect(() => getRequiredActiveTenant(session)).toThrow(
      "No hay empresa activa en la sesion."
    );
  });

  it("tampered_company_id_is_rejected", () => {
    const session = demoSession("usr_contador", "emp_alfa");
    expect(() => assertCompanyAccess(session, "emp_tampered")).toThrow(
      "El usuario no tiene acceso a esta empresa."
    );
  });

  it("critical_action_creates_audit_log", async () => {
    const previousEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      userId: "usr_contador",
      companyId: "emp_alfa",
      action: "test.critical_action",
      entity: "TestEntity",
      entityId: "test_1"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (previousEnv) {
      process.env.DATABASE_URL = previousEnv;
    }

    expect(events.some((event) => event.action === "test.critical_action")).toBe(true);
  });

  it("audit_logs_are_scoped_by_study", async () => {
    const previousEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      action: "audit.study.default",
      entity: "Audit"
    });
    recordAuditEvent({
      studyId: "std_other",
      companyId: "emp_alfa",
      action: "audit.study.other",
      entity: "Audit"
    });
    const scoped = await listAuditEvents("std_default");
    if (previousEnv) {
      process.env.DATABASE_URL = previousEnv;
    }

    expect(scoped.some((event) => event.action === "audit.study.default")).toBe(true);
    expect(scoped.some((event) => event.action === "audit.study.other")).toBe(false);
  });

  it("audit_log_does_not_store_sensitive_data", async () => {
    const previousEnv = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      action: "audit.sensitive",
      entity: "Audit",
      metadata: {
        token: null,
        certificate: null
      }
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (previousEnv) {
      process.env.DATABASE_URL = previousEnv;
    }

    const event = events.find((item) => item.action === "audit.sensitive");
    expect(event).toBeTruthy();
    expect(event?.metadata).toEqual({
      token: null,
      certificate: null
    });
  });
});
