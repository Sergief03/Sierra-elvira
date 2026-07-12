"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { startMatch, scorePoint, closeSet, endMatch } from "@/services/match.service";

export async function createMatch(formData: FormData) {
  const session = await requireRole(["COACH", "SUPER_ADMIN"]);
  const teamId = formData.get("teamId") as string;
  const opponent = (formData.get("opponent") as string)?.trim();
  const dateStr = formData.get("date") as string;
  const timeStr = formData.get("time") as string;
  const location = (formData.get("location") as string)?.trim();

  if (!teamId || !opponent || !dateStr || !timeStr) {
    throw new Error("Todos los campos son obligatorios");
  }

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id, teamId, roleInTeam: { in: ["MAIN_COACH", "SEC_COACH"] } },
  });
  if (!membership && session.user.role !== "SUPER_ADMIN") throw new Error("No autorizado");

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    throw new Error("Fecha u hora inválida");
  }

  const date = new Date(year, month - 1, day, hour, minute);

  await prisma.match.create({
    data: { teamId, opponent, date, location: location || "" },
  });

  revalidatePath(`/coach/teams/${teamId}/matches`);
}

export async function actionStartMatch(matchId: string) {
  await requireRole(["COACH", "SUPER_ADMIN"]);
  await startMatch(matchId);
  revalidatePath(`/matches/${matchId}`);
}

export async function actionScorePoint(matchId: string, side: "our" | "opp", delta: 1 | -1) {
  await requireRole(["COACH", "SUPER_ADMIN"]);
  await scorePoint(matchId, side, delta);
  revalidatePath(`/matches/${matchId}`);
}

export async function actionCloseSet(matchId: string) {
  await requireRole(["COACH", "SUPER_ADMIN"]);
  await closeSet(matchId);
  revalidatePath(`/matches/${matchId}`);
}

export async function actionEndMatch(matchId: string) {
  await requireRole(["COACH", "SUPER_ADMIN"]);
  await endMatch(matchId);
  revalidatePath(`/matches/${matchId}`);
}
