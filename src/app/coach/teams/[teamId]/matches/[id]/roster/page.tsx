import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RosterChecklist } from "./roster-checklist";

export const dynamic = 'force-dynamic';

export default async function RosterPage({
  params,
}: {
  params: Promise<{ teamId: string; id: string }>;
}) {
  const { teamId, id: matchId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id, teamId, roleInTeam: { in: ["MAIN_COACH", "SEC_COACH"] } },
  });
  if (!membership && session.user.role !== "SUPER_ADMIN") notFound();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { roster: true },
  });
  if (!match || match.teamId !== teamId) notFound();

  const players = await prisma.teamMember.findMany({
    where: { teamId, roleInTeam: "PLAYER" },
    include: { user: true },
  });

  const rosterMap = new Map(match.roster.map((r) => [r.playerId, r.status]));

  return (
    <div className="max-w-[32rem]">
      <h2 className="font-display text-headline-md text-primary mb-2">
        Convocatoria: vs {match.opponent}
      </h2>
      <p className="text-body-md text-on-surface-variant mb-4">
        Selecciona los jugadores convocados para este partido
      </p>
      <RosterChecklist
        matchId={matchId}
        players={players.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          selected: rosterMap.has(p.user.id),
          attendanceStatus: rosterMap.get(p.user.id),
        }))}
      />
    </div>
  );
}
