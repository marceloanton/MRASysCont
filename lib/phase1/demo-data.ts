import { permissionsForRole } from "./permissions";
import type { Company, Membership, User, UserRole } from "./types";

export const demoUsers: User[] = [
  {
    id: "usr_contador",
    email: "contador@mrasyscont.local",
    name: "Contador principal",
    active: true
  },
  {
    id: "usr_asistente",
    email: "asistente@mrasyscont.local",
    name: "Asistente del estudio",
    active: true
  },
  {
    id: "usr_cliente",
    email: "cliente@mrasyscont.local",
    name: "Cliente empresa",
    active: true
  }
];

export const demoCompanies: Company[] = [
  {
    id: "emp_alfa",
    legalName: "Alfa Servicios SRL",
    tradeName: "Alfa",
    cuit: "30-70000001-1",
    taxCondition: "Responsable Inscripto",
    status: "ACTIVA"
  },
  {
    id: "emp_beta",
    legalName: "Beta Comercio SA",
    tradeName: "Beta",
    cuit: "30-70000002-2",
    taxCondition: "Responsable Inscripto",
    status: "ACTIVA"
  },
  {
    id: "emp_gamma",
    legalName: "Gamma Monotributo",
    tradeName: "Gamma",
    cuit: "20-30000003-3",
    taxCondition: "Monotributo",
    status: "ACTIVA"
  }
];

const membership = (
  userId: string,
  companyId: string,
  role: UserRole
): Membership => ({
  userId,
  companyId,
  role,
  permissions: permissionsForRole(role)
});

export const demoMemberships: Membership[] = [
  membership("usr_contador", "emp_alfa", "CONTADOR"),
  membership("usr_contador", "emp_beta", "CONTADOR"),
  membership("usr_contador", "emp_gamma", "CONTADOR"),
  membership("usr_asistente", "emp_alfa", "ASISTENTE"),
  membership("usr_asistente", "emp_beta", "ASISTENTE"),
  membership("usr_cliente", "emp_gamma", "CLIENTE")
];

export function getDemoUser(userId: string) {
  return demoUsers.find((user) => user.id === userId && user.active);
}

export function getDemoCompany(companyId: string) {
  return demoCompanies.find((company) => company.id === companyId);
}

export function getDemoMemberships(userId: string) {
  return demoMemberships.filter((membershipItem) => membershipItem.userId === userId);
}
