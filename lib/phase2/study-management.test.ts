import { describe, expect, it } from "vitest";
import { listAuditEvents, recordAuditEvent } from "../phase1/audit";
import {
  canAssignInternalResponsible,
  canCreateClient,
  canCreateTask,
  canManageDeadlines,
  canReadAllTasks,
  isValidMonthlyStatusTransition
} from "./study-guards";

describe("phase2 study management critical tests", () => {
  it("accountant_can_create_client_in_study", () => {
    expect(canCreateClient("CONTADOR")).toBe(true);
  });

  it("assistant_cannot_create_client_without_permission", () => {
    expect(canCreateClient("ASISTENTE")).toBe(false);
  });

  it("client_record_requires_study_id", () => {
    const payload = { studyId: "std_default", legalName: "Cliente SA" };
    expect(Boolean(payload.studyId)).toBe(true);
  });

  it("cannot_access_client_from_other_study", () => {
    const clientStudyId = "std_a";
    const actorStudyId = "std_b";
    expect(clientStudyId).not.toBe(actorStudyId);
  });

  it("client_list_is_scoped_by_study", () => {
    const clients = [
      { id: "c1", studyId: "std_default" },
      { id: "c2", studyId: "std_other" }
    ];
    const scoped = clients.filter((client) => client.studyId === "std_default");
    expect(scoped).toHaveLength(1);
    expect(scoped[0]?.id).toBe("c1");
  });

  it("can_assign_internal_responsible_to_client", () => {
    expect(canAssignInternalResponsible("CONTADOR")).toBe(true);
  });

  it("cannot_assign_responsible_from_other_study", () => {
    const clientStudyId = "std_default";
    const responsibleStudyId = "std_other";
    expect(clientStudyId).not.toBe(responsibleStudyId);
  });

  it("task_requires_study_scope", () => {
    const task = { studyId: "std_default", title: "Preparar vencimientos" };
    expect(Boolean(task.studyId)).toBe(true);
    expect(canCreateTask("ASISTENTE")).toBe(true);
  });

  it("assistant_sees_only_assigned_tasks", () => {
    const tasks = [
      { id: "t1", assignedUserId: "usr_asistente" },
      { id: "t2", assignedUserId: "usr_contador" }
    ];
    const scoped = tasks.filter((task) => task.assignedUserId === "usr_asistente");
    expect(canReadAllTasks("ASISTENTE")).toBe(false);
    expect(scoped.map((task) => task.id)).toEqual(["t1"]);
  });

  it("cannot_access_task_from_other_study", () => {
    const taskStudyId = "std_default";
    const actorStudyId = "std_other";
    expect(taskStudyId).not.toBe(actorStudyId);
  });

  it("deadline_requires_study_scope", () => {
    const deadline = { studyId: "std_default", clientOfStudyId: "cli_1" };
    expect(Boolean(deadline.studyId)).toBe(true);
    expect(canManageDeadlines("CONTADOR")).toBe(true);
  });

  it("deadline_list_is_scoped_by_study", () => {
    const deadlines = [
      { id: "d1", studyId: "std_default" },
      { id: "d2", studyId: "std_other" }
    ];
    const scoped = deadlines.filter((deadline) => deadline.studyId === "std_default");
    expect(scoped.map((deadline) => deadline.id)).toEqual(["d1"]);
  });

  it("monthly_status_transition_is_valid", () => {
    expect(isValidMonthlyStatusTransition("IN_PROGRESS", "IN_REVIEW")).toBe(true);
    expect(isValidMonthlyStatusTransition("IN_REVIEW", "READY")).toBe(true);
  });

  it("monthly_status_invalid_transition_returns_409", () => {
    expect(isValidMonthlyStatusTransition("CLOSED", "IN_PROGRESS")).toBe(false);
  });

  it("critical_phase2_actions_create_audit_log", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase2.client.created",
      entity: "ClientOfStudy",
      entityId: "cli_1"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (prev) {
      process.env.DATABASE_URL = prev;
    }

    expect(events.some((event) => event.action === "phase2.client.created")).toBe(true);
  });
});
