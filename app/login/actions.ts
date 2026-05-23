"use server";

import { redirect } from "next/navigation";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { authenticateUser, createDatabaseSession } from "@/lib/phase1/repository";
import { clearSession, setDemoUser, setSessionCookie } from "@/lib/phase1/session";

export async function loginWithPassword(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await authenticateUser(email, password);

  if (!user) {
    return {
      error: "Email o contrasena invalidos, o PostgreSQL no esta disponible."
    };
  }

  const session = await createDatabaseSession(user.id);

  if (!session) {
    return {
      error: "No se pudo crear la sesion."
    };
  }

  await setSessionCookie(session.id);
  recordAuditEvent({
    userId: user.id,
    action: "auth.login",
    entity: "Session",
    entityId: session.id
  });
  redirect("/");
}

export async function loginWithDemo(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  await setDemoUser(userId);
  recordAuditEvent({
    userId,
    action: "auth.demo_login",
    entity: "User",
    entityId: userId
  });
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
