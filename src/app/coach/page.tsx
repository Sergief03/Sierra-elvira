import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthLabel } from "@/lib/utils";
import { CoachDashboardClient } from "./_coach-dashboard-client";

export const dynamic = 'force-dynamic';

export default async function CoachDashboardPage() {
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
          Contacta con el administrador del club para que te asigne uno o más equipos como entrenador.
        </p>
        <a
          href="/admin/teams"
          className="mt-2 inline-flex items-center gap-2 bg-primary text-on-primary font-sans text-label-bold px-lg py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">group_add</span>
          Ver Equipos
        </a>
      </div>
    );
  }

  const teamIds = memberships.map((m) => m.teamId);
  const currentMonth = getCurrentMonthLabel();

  const teamPlayerMemberships = await prisma.teamMember.findMany({
    where: { teamId: { in: teamIds }, roleInTeam: "PLAYER" },
    include: { user: true, team: true },
  });

  const playerIds = [...new Set(teamPlayerMemberships.map((p) => p.userId))];

  const payments = await prisma.payment.findMany({
    where: { month: currentMonth, playerId: { in: playerIds } },
  });

  const paidPlayers = new Set(payments.map((p) => p.playerId));
  const paymentAmounts = new Map(payments.map((p) => [p.playerId, p.amount]));

  const playersByTeam: Record<string, Array<{ id: string; name: string; email: string }>> = {};
  for (const pm of teamPlayerMemberships) {
    const list = playersByTeam[pm.teamId] ?? [];
    list.push({ id: pm.user.id, name: pm.user.name, email: pm.user.email });
    playersByTeam[pm.teamId] = list;
  }

  // upcoming matches for next-match card
  const upcomingMatches = await prisma.match.findMany({
    where: { teamId: { in: teamIds }, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { roster: true },
  });

  // ALL matches (past + future) for calendar
  const calendarMatches = await prisma.match.findMany({
    where: { teamId: { in: teamIds } },
    orderBy: { date: "asc" },
  });

  const nextMatchByTeam: Record<string, {
    id: string;
    opponent: string;
    date: string;
    location: string;
    rosterPlayerIds: string[];
  } | null> = {};

  for (const teamId of teamIds) {
    const match = upcomingMatches.find((m) => m.teamId === teamId);
    if (match) {
      nextMatchByTeam[teamId] = {
        id: match.id,
        opponent: match.opponent,
        date: match.date.toISOString(),
        location: match.location,
        rosterPlayerIds: match.roster.map((r) => r.playerId),
      };
    } else {
      nextMatchByTeam[teamId] = null;
    }
  }

  const allMatchesByTeam: Record<string, Array<{ id: string; opponent: string; date: string; location: string; status: string }>> = {};
  for (const m of calendarMatches) {
    const list = allMatchesByTeam[m.teamId] ?? [];
    list.push({ id: m.id, opponent: m.opponent, date: m.date.toISOString(), location: m.location, status: m.status });
    allMatchesByTeam[m.teamId] = list;
  }

  return (
    <CoachDashboardClient
      memberships={memberships.map((m) => ({
        teamId: m.teamId,
        teamName: m.team.name,
        teamCategory: m.team.category,
        roleInTeam: m.roleInTeam,
      }))}
      playersByTeam={playersByTeam}
      paidPlayers={[...paidPlayers]}
      paymentAmounts={Object.fromEntries(paymentAmounts)}
      nextMatchByTeam={nextMatchByTeam}
      allMatchesByTeam={allMatchesByTeam}
      currentMonth={currentMonth}
      coachId={coachId}
    />
  );
}
