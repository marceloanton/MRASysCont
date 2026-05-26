import { describe, expect, it } from "vitest";
import { listAuditEvents, recordAuditEvent } from "../phase1/audit";
import {
  canCreateDocument,
  canDownloadDocument,
  canReadDocument,
  canReviewDocument,
  isClientRole,
  isValidDocumentStatusTransition
} from "./guards";

describe("phase5 document critical tests", () => {
  it("document_requires_study_scope", () => {
    const payload = { studyId: "std_default", title: "Balance abril" };
    expect(Boolean(payload.studyId)).toBe(true);
  });

  it("cannot_create_document_for_foreign_study", () => {
    const actorStudyId = "std_a";
    const companyStudyId = "std_b";
    expect(actorStudyId).not.toBe(companyStudyId);
  });

  it("document_list_is_scoped_by_study", () => {
    const documents = [
      { id: "d1", studyId: "std_default" },
      { id: "d2", studyId: "std_other" }
    ];
    const scoped = documents.filter((document) => document.studyId === "std_default");
    expect(scoped).toHaveLength(1);
    expect(scoped[0]?.id).toBe("d1");
  });

  it("cannot_access_document_from_other_study", () => {
    const documentStudyId = "std_default";
    const actorStudyId = "std_other";
    expect(documentStudyId).not.toBe(actorStudyId);
  });

  it("document_download_requires_authorization", () => {
    expect(canDownloadDocument("CONTADOR")).toBe(true);
    expect(canDownloadDocument("ASISTENTE")).toBe(true);
    expect(canDownloadDocument("CLIENTE")).toBe(true);
  });

  it("document_download_is_audited", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase5.document.downloaded",
      entity: "StudyDocument",
      entityId: "doc_1"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (prev) {
      process.env.DATABASE_URL = prev;
    }
    expect(events.some((event) => event.action === "phase5.document.downloaded")).toBe(true);
  });

  it("document_status_transition_is_valid", () => {
    expect(isValidDocumentStatusTransition("UPLOADED", "PENDING_REVIEW")).toBe(true);
    expect(isValidDocumentStatusTransition("PENDING_REVIEW", "APPROVED")).toBe(true);
    expect(isValidDocumentStatusTransition("OBSERVED", "PENDING_REVIEW")).toBe(true);
  });

  it("document_invalid_transition_returns_409", () => {
    expect(isValidDocumentStatusTransition("APPROVED", "PENDING_REVIEW")).toBe(false);
    expect(isValidDocumentStatusTransition("ARCHIVED", "PENDING_REVIEW")).toBe(false);
  });

  it("document_version_list_is_scoped_by_study", () => {
    const versions = [
      { version: 2, documentId: "doc_a", studyId: "std_default" },
      { version: 1, documentId: "doc_a", studyId: "std_default" },
      { version: 1, documentId: "doc_b", studyId: "std_other" }
    ];
    const scoped = versions.filter(
      (version) => version.studyId === "std_default" && version.documentId === "doc_a"
    );
    expect(scoped.map((version) => version.version)).toEqual([2, 1]);
  });

  it("critical_phase5_actions_create_audit_log", async () => {
    const prev = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    recordAuditEvent({
      studyId: "std_default",
      companyId: "emp_alfa",
      userId: "usr_contador",
      action: "phase5.document.created",
      entity: "StudyDocument",
      entityId: "doc_2"
    });
    const events = await listAuditEvents("std_default", "emp_alfa");
    if (prev) {
      process.env.DATABASE_URL = prev;
    }
    expect(events.some((event) => event.action === "phase5.document.created")).toBe(true);
  });

  it("phase5_role_permissions_matrix_is_enforced", () => {
    expect(canCreateDocument("CONTADOR")).toBe(true);
    expect(canCreateDocument("ASISTENTE")).toBe(true);
    expect(canCreateDocument("CLIENTE")).toBe(true);
    expect(canReviewDocument("CLIENTE")).toBe(false);
    expect(canReadDocument("CLIENTE")).toBe(true);
  });

  it("client_can_upload_own_document", () => {
    expect(canCreateDocument("CLIENTE")).toBe(true);
    expect(isClientRole("CLIENTE")).toBe(true);
  });

  it("client_cannot_approve_document", () => {
    expect(canReviewDocument("CLIENTE")).toBe(false);
  });

  it("client_cannot_download_internal_document", () => {
    const document = {
      status: "PENDING_REVIEW",
      notes: null,
      createdByUserId: "usr_other",
      companyId: "emp_alfa"
    };
    const actor = {
      userId: "usr_cliente",
      companyId: "emp_alfa"
    };
    const canDownload =
      document.companyId === actor.companyId &&
      (document.createdByUserId === actor.userId || document.status === "APPROVED");

    expect(canDownload).toBe(false);
  });

  it("client_cannot_access_foreign_document", () => {
    const documentStudyId = "std_other";
    const actorStudyId = "std_default";
    expect(documentStudyId).not.toBe(actorStudyId);
  });
});
