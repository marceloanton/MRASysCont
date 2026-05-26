"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { getSessionContext } from "@/lib/phase1/session";
import { getRequiredActiveTenant } from "@/lib/phase1/tenant-access";
import { createStudyTask } from "@/lib/phase2/study-repository";

export type TaskFormState = {
  ok: boolean;
  message: string;
};

const initialState: TaskFormState = { ok: false, message: "" };

export async function createTaskAction(
  _previousState: TaskFormState = initialState,
  formData: FormData
): Promise<TaskFormState> {
  void _previousState;
  const session = await getSessionContext();
  const tenant = getRequiredActiveTenant(session);
  const title = String(formData.get("title") ?? "").trim();
  const clientOfStudyId = String(formData.get("clientOfStudyId") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "").trim();
  const assignedUserId = String(formData.get("assignedUserId") ?? "").trim();
  if (!title) {
    return { ok: false, message: "Titulo obligatorio." };
  }

  try {
    const task = await createStudyTask({
      studyId: tenant.company.studyId,
      actorRole: tenant.membership.role,
      actorUserId: session.user.id,
      title,
      clientOfStudyId: clientOfStudyId || undefined,
      companyId: companyId || undefined,
      assignedUserId: assignedUserId || undefined
    });
    recordAuditEvent({
      studyId: tenant.company.studyId,
      userId: session.user.id,
      companyId: tenant.company.id,
      action: "phase2.task.created",
      entity: "StudyTask",
      entityId: task.id
    });
    revalidatePath("/estudio/tareas");
    revalidatePath("/estudio/dashboard");
    return { ok: true, message: "Tarea creada." };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Error creando tarea." };
  }
}
