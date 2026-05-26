import { getDemoCompany, getDemoStudy } from "./demo-data";
import type { Company, PermissionKey, SessionContext, TenantAccess } from "./types";

export class TenantAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantAccessError";
  }
}

export function getAllowedCompanyIds(session: SessionContext) {
  return new Set(session.memberships.map((membership) => membership.companyId));
}

export function getAllowedStudyIds(session: SessionContext) {
  return new Set(session.memberships.map((membership) => membership.studyId));
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

  const activeStudyId = session.activeStudyId ?? membership.studyId;
  if (membership.studyId !== activeStudyId) {
    throw new TenantAccessError("La empresa no pertenece al estudio activo.");
  }

  if (membership.studyMembershipStatus && membership.studyMembershipStatus !== "ACTIVE") {
    throw new TenantAccessError("La membresia del estudio no esta activa.");
  }

  if (requiredPermission && !membership.permissions[requiredPermission]) {
    throw new TenantAccessError("El usuario no tiene permiso para esta accion.");
  }

  const company = getDemoCompany(companyId);

  if (!company || company.status !== "ACTIVA") {
    throw new TenantAccessError("La empresa no esta activa.");
  }

  if (company.studyId !== membership.studyId) {
    throw new TenantAccessError("La empresa no pertenece al estudio del usuario.");
  }

  const study = getDemoStudy(membership.studyId);
  if (!study) {
    throw new TenantAccessError("El estudio activo no esta disponible.");
  }

  return {
    user: session.user,
    company,
    membership
  };
}

export function getActiveTenant(session: SessionContext): TenantAccess {
  if (!session.activeStudyId) {
    const firstStudy = session.memberships.at(0)?.studyId;
    if (!firstStudy) {
      throw new TenantAccessError("El usuario no tiene estudios asignados.");
    }
    session.activeStudyId = firstStudy;
  }

  const activeCompanyId =
    session.activeCompanyId ?? session.memberships.at(0)?.companyId;

  if (!activeCompanyId) {
    throw new TenantAccessError("El usuario no tiene empresas asignadas.");
  }

  return assertCompanyAccess(session, activeCompanyId);
}

export function getRequiredActiveTenant(session: SessionContext): TenantAccess {
  if (!session.activeStudyId) {
    throw new TenantAccessError("No hay estudio activo en la sesion.");
  }

  if (!session.activeCompanyId) {
    throw new TenantAccessError("No hay empresa activa en la sesion.");
  }

  return assertCompanyAccess(session, session.activeCompanyId);
}

export function assertCompanyAccessWithCompanies(
  session: SessionContext,
  companies: Company[],
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

  const activeStudyId = session.activeStudyId ?? membership.studyId;
  if (membership.studyId !== activeStudyId) {
    throw new TenantAccessError("La empresa no pertenece al estudio activo.");
  }

  if (membership.studyMembershipStatus && membership.studyMembershipStatus !== "ACTIVE") {
    throw new TenantAccessError("La membresia del estudio no esta activa.");
  }

  if (requiredPermission && !membership.permissions[requiredPermission]) {
    throw new TenantAccessError("El usuario no tiene permiso para esta accion.");
  }

  const company = companies.find((companyItem) => companyItem.id === companyId);

  if (!company || company.status !== "ACTIVA") {
    throw new TenantAccessError("La empresa no esta activa.");
  }

  if (company.studyId !== membership.studyId) {
    throw new TenantAccessError("La empresa no pertenece al estudio del usuario.");
  }

  return {
    user: session.user,
    company,
    membership
  };
}

export function getActiveTenantFromCompanies(
  session: SessionContext,
  companies: Company[]
): TenantAccess {
  if (!session.activeStudyId) {
    const firstStudy = session.memberships.at(0)?.studyId;
    if (!firstStudy) {
      throw new TenantAccessError("El usuario no tiene estudios asignados.");
    }
    session.activeStudyId = firstStudy;
  }

  const activeCompanyId =
    session.activeCompanyId ?? session.memberships.at(0)?.companyId;

  if (!activeCompanyId) {
    throw new TenantAccessError("El usuario no tiene empresas asignadas.");
  }

  return assertCompanyAccessWithCompanies(session, companies, activeCompanyId);
}

export function getRequiredActiveTenantFromCompanies(
  session: SessionContext,
  companies: Company[]
): TenantAccess {
  if (!session.activeStudyId) {
    throw new TenantAccessError("No hay estudio activo en la sesion.");
  }

  if (!session.activeCompanyId) {
    throw new TenantAccessError("No hay empresa activa en la sesion.");
  }

  return assertCompanyAccessWithCompanies(
    session,
    companies,
    session.activeCompanyId
  );
}
