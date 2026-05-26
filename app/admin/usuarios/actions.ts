"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { assignUserCompany, createUserWithMembership } from "@/lib/phase1/repository";
import { getSessionContext } from "@/lib/phase1/session";
import { getRequiredActiveTenant } from "@/lib/phase1/tenant-access";
import type { UserRole } from "@/lib/phase1/types";

export type UserFormState = {
  message: string;
  ok: boolean;
};

const initialState: UserFormState = {
  message: "",
  ok: false
};

function isUserRole(value: string): value is UserRole {
  return value === "CONTADOR" || value === "ASISTENTE" || value === "CLIENTE";
}

export async function createUserAction(
  _previousState: UserFormState = initialState,
  formData: FormData
): Promise<UserFormState> {
  void _previousState;

  const session = await getSessionContext();
  const activeTenant = getRequiredActiveTenant(session);

  if (!activeTenant.membership.permissions.manageUsers) {
    return {
      ok: false,
      message: "No tenes permiso para crear usuarios."
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const companyId = String(formData.get("companyId") ?? "");
  const roleValue = String(formData.get("role") ?? "");

  if (!name || !email || !password || !companyId || !isUserRole(roleValue)) {
    return {
      ok: false,
      message: "Nombre, email, contrasena, empresa y rol son obligatorios."
    };
  }

  const result = await createUserWithMembership({
    name,
    email,
    password,
    studyId: activeTenant.company.studyId,
    companyId,
    role: roleValue
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: activeTenant.company.studyId,
      userId: session.user.id,
      companyId: activeTenant.company.id,
      action: "user.created",
      entity: "User",
      entityId: result.userId,
      metadata: {
        email,
        role: roleValue
      }
    });
  }

  revalidatePath("/admin/usuarios");

  return {
    ok: result.ok,
    message: result.message
  };
}

export async function assignUserCompanyAction(
  _previousState: UserFormState = initialState,
  formData: FormData
): Promise<UserFormState> {
  void _previousState;

  const session = await getSessionContext();
  const activeTenant = getRequiredActiveTenant(session);

  if (!activeTenant.membership.permissions.manageUsers) {
    return {
      ok: false,
      message: "No tenes permiso para asignar usuarios."
    };
  }

  const userId = String(formData.get("userId") ?? "");
  const companyId = String(formData.get("companyId") ?? "");
  const roleValue = String(formData.get("role") ?? "");

  if (!userId || !companyId || !isUserRole(roleValue)) {
    return {
      ok: false,
      message: "Usuario, empresa y rol son obligatorios."
    };
  }

  const result = await assignUserCompany({
    studyId: activeTenant.company.studyId,
    userId,
    companyId,
    role: roleValue
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: activeTenant.company.studyId,
      userId: session.user.id,
      companyId: activeTenant.company.id,
      action: "user.company_assigned",
      entity: "UserCompany",
      entityId: `${userId}:${companyId}`,
      metadata: {
        assignedUserId: userId,
        assignedCompanyId: companyId,
        role: roleValue
      }
    });
  }

  revalidatePath("/admin/usuarios");

  return {
    ok: result.ok,
    message: result.message
  };
}

