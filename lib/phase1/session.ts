import "server-only";

import { cookies } from "next/headers";
import type { SessionContext } from "./types";
import { getWorkspaceData } from "./repository";

const userCookie = "mrasyscont_demo_user";
const companyCookie = "mrasyscont_demo_company";

export async function getSessionContext(): Promise<SessionContext> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(userCookie)?.value ?? "usr_contador";
  const activeCompanyId = cookieStore.get(companyCookie)?.value;
  const workspace = await getWorkspaceData(userId, activeCompanyId);

  return workspace.session;
}

export async function getWorkspaceContext() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(userCookie)?.value ?? "usr_contador";
  const activeCompanyId = cookieStore.get(companyCookie)?.value;

  return getWorkspaceData(userId, activeCompanyId);
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
