"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getSessionContext, setActiveTenant } from "@/lib/phase1/session";
import { assertCompanyAccess } from "@/lib/phase1/tenant-access";
import { logout } from "./login/actions";

export { logout };

export async function changeActiveCompany(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const session = await getSessionContext();
  const access = assertCompanyAccess(session, companyId);

  await setActiveTenant(access.company.studyId, companyId);
  recordAuditEvent({
    studyId: access.company.studyId,
    userId: session.user.id,
    companyId,
    action: "tenant.active_company_changed",
    entity: "Company",
    entityId: access.company.id
  });
  revalidatePath("/");
  redirect("/");
}
