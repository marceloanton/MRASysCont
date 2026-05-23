import type { PermissionKey, PermissionSet, UserRole } from "./types";

export const allPermissions: PermissionKey[] = [
  "manageSettings",
  "manageUsers",
  "postAccounting",
  "issueInvoices",
  "reviewDocuments",
  "readReports",
  "uploadDocuments"
];

export function permissionsForRole(role: UserRole): PermissionSet {
  if (role === "CONTADOR") {
    return {
      manageSettings: true,
      manageUsers: true,
      postAccounting: true,
      issueInvoices: true,
      reviewDocuments: true,
      readReports: true,
      uploadDocuments: true
    };
  }

  if (role === "ASISTENTE") {
    return {
      manageSettings: false,
      manageUsers: false,
      postAccounting: true,
      issueInvoices: true,
      reviewDocuments: true,
      readReports: true,
      uploadDocuments: true
    };
  }

  return {
    manageSettings: false,
    manageUsers: false,
    postAccounting: false,
    issueInvoices: false,
    reviewDocuments: false,
    readReports: true,
    uploadDocuments: true
  };
}
