import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatchesClient } from "./matches-client";

export const dynamic = 'force-dynamic';

export default async function PlayerMatchesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const memberships = await prisma.teamMember.findMany({
    where: { userId, roleInTeam: "PLAYER" },
    include: { team: true },
  });

  if (memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-6xl text-outline">sports_volleyball</span>
        <p className="font-sans text-body-lg text-on-surface">No tienes equipos asignados</p>
        <p className="font-sans text-body-md text-on-surface-variant text-center max-w-md">
          Los partidos aparecerán aquí cuando te asignen a un equipo.
        </p>
      </div>
    );
  }

  const teamIds = memberships.map((m) => m.teamId);

  const matches = await prisma.match.findMany({
    where: { teamId: { in: teamIds } },
    include: {
      team: true,
      sets: { orderBy: { setNumber: "asc" } },
      roster: { where: { playerId: userId } },
    },
    orderBy: { date: "desc" },
  });

  const serialized = matches.map((m) => ({
    id: m.id,
    teamId: m.teamId,
    teamName: m.team.name,
    teamCategory: m.team.category,
    opponent: m.opponent,
    date: m.date.toISOString(),
    location: m.location,
    status: m.status,
    ourTotalSets: m.ourTotalSets,
    oppTotalSets: m.oppTotalSets,
    sets: m.sets.map((s) => ({
      setNumber: s.setNumber,
      ourPoints: s.ourPoints,
      oppPoints: s.oppPoints,
    })),
    rosterStatus: m.roster[0]?.status ?? null,
  }));

  return (
    <MatchesClient
      teams={memberships.map((m) => ({ id: m.team.id, name: m.team.name, category: m.team.category }))}
      matches={serialized}
      role="PLAYER"
    />
  );
}
