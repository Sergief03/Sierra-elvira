"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole, requireAuth } from "@/lib/rbac";

const VALID_STATUSES = ["CONFIRMED", "DECLINED", "PENDING"] as const;

export async function toggleRosterPlayer(matchId: string, playerId: string) {
  await requireRole(["COACH", "SUPER_ADMIN"]);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.roster.findUnique({
      where: { matchId_playerId: { matchId, playerId } },
    });

    if (existing) {
      await tx.roster.delete({
        where: { id: existing.id },
      });
    } else {
      await tx.roster.create({
        data: { matchId, playerId },
      });
    }
  });

  revalidatePath("/coach/teams/[teamId]/matches/[id]/roster", "page");
}

export async function updateMatchAttendance(matchId: string, status: string) {
  if (!VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    throw new Error("Estado de asistencia inválido");
  }

  const session = await requireAuth();
  const playerId = session.user.id;

  const rosterItem = await prisma.roster.findUnique({
    where: { matchId_playerId: { matchId, playerId } },
  });

  if (!rosterItem) {
    throw new Error("No estás convocado para este partido");
  }

  await prisma.roster.update({
    where: { id: rosterItem.id },
    data: { status },
  });

  revalidatePath("/dashboard/player", "page");
  revalidatePath(`/dashboard/matches/${matchId}`, "page");
}
