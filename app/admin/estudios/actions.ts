"use server";

import { revalidatePath } from "next/cache";
import { recordAuditEvent } from "@/lib/phase1/audit";
import { createStudy } from "@/lib/phase1/repository";
import { getSessionContext } from "@/lib/phase1/session";
import { getRequiredActiveTenant } from "@/lib/phase1/tenant-access";

export type StudyFormState = {
  ok: boolean;
  message: string;
};

const initialState: StudyFormState = {
  ok: false,
  message: ""
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createStudyAction(
  _previousState: StudyFormState = initialState,
  formData: FormData
): Promise<StudyFormState> {
  void _previousState;

  const session = await getSessionContext();
  const activeTenant = getRequiredActiveTenant(session);

  if (!activeTenant.membership.permissions.manageSettings) {
    return {
      ok: false,
      message: "No tenes permiso para crear estudios."
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = normalizeSlug(String(formData.get("slug") ?? ""));

  if (!name || !slug) {
    return {
      ok: false,
      message: "Nombre y slug son obligatorios."
    };
  }

  const result = await createStudy({
    name,
    slug
  });

  if (result.ok) {
    recordAuditEvent({
      studyId: activeTenant.company.studyId,
      userId: session.user.id,
      companyId: activeTenant.company.id,
      action: "study.created",
      entity: "Study",
      entityId: result.studyId,
      metadata: {
        slug
      }
    });
  }

  revalidatePath("/admin/estudios");

  return {
    ok: result.ok,
    message: result.message
  };
}

