import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatchesClient } from "@/app/dashboard/matches/matches-client";

export const dynamic = 'force-dynamic';

export default async function CoachMatchesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const coachId = session.user.id;

  const memberships = await prisma.teamMember.findMany({
    where: {
      userId: coachId,
      roleInTeam: { in: ["MAIN_COACH", "SEC_COACH"] },
    },
    include: { team: true },
  });

  if (memberships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="material-symbols-outlined text-6xl text-outline">group_off</span>
        <p className="font-sans text-body-lg text-on-surface">No estás asignado a ningún equipo</p>
        <p className="font-sans text-body-md text-on-surface-variant text-center max-w-md">
          Los partidos aparecerán aquí cuando te asignen a uno o más equipos como entrenador.
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
  }));

  return (
    <MatchesClient
      teams={memberships.map((m) => ({ id: m.team.id, name: m.team.name, category: m.team.category }))}
      matches={serialized}
      role="COACH"
    />
  );
}
