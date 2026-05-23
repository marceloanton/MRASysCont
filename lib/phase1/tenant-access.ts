import { getDemoCompany } from "./demo-data";
import type { PermissionKey, SessionContext, TenantAccess } from "./types";

export class TenantAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantAccessError";
  }
}

export function getAllowedCompanyIds(session: SessionContext) {
  return new Set(session.memberships.map((membership) => membership.companyId));
}

export function assertCompanyAccess(
  session: SessionContext,
  companyId: string,
  requiredPermission?: PermissionKey
): TenantAccess {
  if (!session.user.active) {
    throw new TenantAccessError("El usuario esta inactivo.");
  }

  const membership = session.memberships.find(
    (membershipItem) => membershipItem.companyId === companyId
  );

  if (!membership) {
    throw new TenantAccessError("El usuario no tiene acceso a esta empresa.");
  }

  if (requiredPermission && !membership.permissions[requiredPermission]) {
    throw new TenantAccessError("El usuario no tiene permiso para esta accion.");
  }

  const company = getDemoCompany(companyId);

  if (!company || company.status !== "ACTIVA") {
    throw new TenantAccessError("La empresa no esta activa.");
  }

  return {
    user: session.user,
    company,
    membership
  };
}

export function getActiveTenant(session: SessionContext): TenantAccess {
  const activeCompanyId =
    session.activeCompanyId ?? session.memberships.at(0)?.companyId;

  if (!activeCompanyId) {
    throw new TenantAccessError("El usuario no tiene empresas asignadas.");
  }

  return assertCompanyAccess(session, activeCompanyId);
}
