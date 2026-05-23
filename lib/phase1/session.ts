import "server-only";

import { cookies } from "next/headers";
import { getDemoMemberships, getDemoUser } from "./demo-data";
import type { SessionContext } from "./types";

const userCookie = "mrasyscont_demo_user";
const companyCookie = "mrasyscont_demo_company";

export async function getSessionContext(): Promise<SessionContext> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(userCookie)?.value ?? "usr_contador";
  const user = getDemoUser(userId) ?? getDemoUser("usr_contador");

  if (!user) {
    throw new Error("No hay usuario demo disponible.");
  }

  return {
    user,
    memberships: getDemoMemberships(user.id),
    activeCompanyId: cookieStore.get(companyCookie)?.value
  };
}

export async function setDemoUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(userCookie, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  cookieStore.delete(companyCookie);
}

export async function setActiveCompany(companyId: string) {
  const cookieStore = await cookies();
  cookieStore.set(companyCookie, companyId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}
