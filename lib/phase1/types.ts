export type UserRole = "CONTADOR" | "ASISTENTE" | "CLIENTE";

export type PermissionKey =
  | "manageSettings"
  | "manageUsers"
  | "postAccounting"
  | "issueInvoices"
  | "reviewDocuments"
  | "readReports"
  | "uploadDocuments";

export type PermissionSet = Record<PermissionKey, boolean>;

export type CompanyStatus = "ACTIVA" | "SUSPENDIDA" | "ARCHIVADA";

export type User = {
  id: string;
  email: string;
  name: string;
  active: boolean;
};

export type Study = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
};

export type Company = {
  id: string;
  studyId: string;
  legalName: string;
  tradeName?: string;
  cuit: string;
  taxCondition: string;
  status: CompanyStatus;
};

export type Membership = {
  studyId: string;
  userId: string;
  companyId: string;
  role: UserRole;
  studyMembershipStatus?: "INVITED" | "ACTIVE" | "SUSPENDED" | "DISABLED";
  permissions: PermissionSet;
};

export type SessionContext = {
  user: User;
  memberships: Membership[];
  activeStudyId?: string;
  activeCompanyId?: string;
};

export type TenantAccess = {
  user: User;
  company: Company;
  membership: Membership;
};

export type AuditEventInput = {
  studyId?: string;
  userId?: string;
  companyId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};
