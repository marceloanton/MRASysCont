"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getSessionContext, setActiveCompany, setDemoUser } from "@/lib/phase1/session";
import { assertCompanyAccess } from "@/lib/phase1/tenant-access";

export async function changeDemoUser(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  await setDemoUser(userId);
  recordAuditEvent({
    userId,
    action: "auth.demo_user_changed",
    entity: "User",
    entityId: userId
  });
  revalidatePath("/");
  redirect("/");
}

export async function changeActiveCompany(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const session = await getSessionContext();
  const access = assertCompanyAccess(session, companyId);

  await setActiveCompany(companyId);
  recordAuditEvent({
    userId: session.user.id,
    companyId,
    action: "tenant.active_company_changed",
    entity: "Company",
    entityId: access.company.id
  });
  revalidatePath("/");
}
