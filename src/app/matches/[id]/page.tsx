import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MatchDetailClient } from "./match-detail-client";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    select: { opponent: true, team: { select: { name: true } } },
  });
  if (!match) return { title: "Partido no encontrado" };
  return {
    title: `${match.team.name} vs ${match.opponent} - Sierra Elvira`,
    description: `Sigue el partido de ${match.team.name} contra ${match.opponent} en vivo.`,
  };
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      team: true,
      sets: { orderBy: { setNumber: "asc" } },
    },
  });
  if (!match) notFound();

  let isCoach = false;
  if (session?.user) {
    const membership = await prisma.teamMember.findFirst({
      where: {
        userId: session.user.id,
        teamId: match.teamId,
        roleInTeam: { in: ["MAIN_COACH", "SEC_COACH"] },
      },
    });
    if (membership || session.user.role === "SUPER_ADMIN") {
      isCoach = true;
    }
  }

  const initial = {
    id: match.id,
    teamId: match.teamId,
    teamName: match.team.name,
    opponent: match.opponent,
    location: match.location,
    date: match.date.toISOString(),
    status: match.status,
    currentSet: match.currentSet,
    ourTotalSets: match.ourTotalSets,
    oppTotalSets: match.oppTotalSets,
    sets: match.sets.map((s) => ({
      setNumber: s.setNumber,
      ourPoints: s.ourPoints,
      oppPoints: s.oppPoints,
    })),
  };

  return <MatchDetailClient initial={initial} matchId={id} isCoach={isCoach} />;
}
