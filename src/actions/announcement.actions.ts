"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function createAnnouncement(formData: FormData) {
  await requireRole(["COACH", "SUPER_ADMIN"]);

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const targetTeamId = formData.get("targetTeamId") as string | null;

  if (!title || !content) {
    throw new Error("El título y contenido son obligatorios");
  }

  await prisma.announcement.create({
    data: { title, content, targetTeamId: targetTeamId || null },
  });

  revalidatePath("/coach/teams/[teamId]");
}
