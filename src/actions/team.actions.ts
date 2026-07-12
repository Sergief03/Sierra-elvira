"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { TeamRole } from "@prisma/client";

const VALID_TEAM_ROLES: TeamRole[] = ["PLAYER", "MAIN_COACH", "SEC_COACH"];

export async function createTeam(formData: FormData) {
  await requireRole(["SUPER_ADMIN"]);

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();

  if (!name) throw new Error("El nombre del equipo es obligatorio");

  await prisma.team.create({
    data: { name, category: category || "" },
  });

  revalidatePath("/admin/teams");
}

export async function assignTeamMember(teamId: string, userId: string, roleInTeam: string) {
  await requireRole(["SUPER_ADMIN"]);

  if (!VALID_TEAM_ROLES.includes(roleInTeam as TeamRole)) {
    throw new Error("Rol de equipo inválido");
  }

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId, teamId } },
    update: { roleInTeam: roleInTeam as TeamRole },
    create: { userId, teamId, roleInTeam: roleInTeam as TeamRole },
  });

  revalidatePath("/admin/teams");
}

export async function removeTeamMember(teamId: string, userId: string) {
  await requireRole(["SUPER_ADMIN"]);

  await prisma.teamMember.deleteMany({
    where: { userId, teamId },
  });

  revalidatePath("/admin/teams");
}
