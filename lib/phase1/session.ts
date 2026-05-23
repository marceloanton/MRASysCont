import "server-only";

import { cookies } from "next/headers";
import type { SessionContext } from "./types";
import {
  deleteDatabaseSession,
  getWorkspaceBySessionId,
  getWorkspaceData,
  updateSessionCompany
} from "./repository";

const sessionCookie = "mrasyscont_session";
const userCookie = "mrasyscont_demo_user";
const companyCookie = "mrasyscont_demo_company";

export async function getSessionContext(): Promise<SessionContext> {
  const workspace = await getWorkspaceContext();

  if (!workspace) {
    throw new Error("No hay sesion activa.");
  }

  return workspace.session;
}

export async function getWorkspaceContext() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookie)?.value;

  if (sessionId) {
    const databaseWorkspace = await getWorkspaceBySessionId(sessionId);

    if (databaseWorkspace) {
      return databaseWorkspace;
    }
  }

  const demoUserId = cookieStore.get(userCookie)?.value;

  if (!demoUserId) {
    return null;
  }

  const activeCompanyId = cookieStore.get(companyCookie)?.value;

  return getWorkspaceData(demoUserId, activeCompanyId);
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  cookieStore.delete(userCookie);
  cookieStore.delete(companyCookie);
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
  const sessionId = cookieStore.get(sessionCookie)?.value;

  if (sessionId) {
    await updateSessionCompany(sessionId, companyId);
  }

  cookieStore.set(companyCookie, companyId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(sessionCookie)?.value;

  if (sessionId) {
    await deleteDatabaseSession(sessionId);
  }

  cookieStore.delete(sessionCookie);
  cookieStore.delete(userCookie);
  cookieStore.delete(companyCookie);
}
