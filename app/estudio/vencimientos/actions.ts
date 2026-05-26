"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getSessionContext } from "@/lib/phase1/session";
import { getRequiredActiveTenant } from "@/lib/phase1/tenant-access";
import { createStudyDeadline } from "@/lib/phase2/study-repository";

export type DeadlineFormState = {
  ok: boolean;
  message: string;
};

const initialState: DeadlineFormState = { ok: false, message: "" };

export async function createDeadlineAction(
  _previousState: DeadlineFormState = initialState,
  formData: FormData
): Promise<DeadlineFormState> {
  void _previousState;
  const session = await getSessionContext();
  const tenant = getRequiredActiveTenant(session);
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const clientOfStudyId = String(formData.get("clientOfStudyId") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();

  if (!title || !dueDate || !clientOfStudyId) {
    return { ok: false, message: "Titulo, fecha y cliente son obligatorios." };
  }

  try {
    const deadline = await createStudyDeadline({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      title,
      dueDate: new Date(dueDate),
      clientOfStudyId,
      companyId: companyId || undefined
    });
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: session.user.id,
      companyId: tenant.company.id,
      action: "phase2.deadline.created",
      entity: "StudyDeadline",
      entityId: deadline.id
    });
    revalidatePath("/estudio/vencimientos");
    revalidatePath("/estudio/dashboard");
    return { ok: true, message: "Vencimiento creado." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error creando vencimiento." };
  }
}
