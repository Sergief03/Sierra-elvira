import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PublicCalendarClient } from "./public-calendar-client";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Calendario de Partidos - Sierra Elvira",
  description: "Consulta todos los partidos del Club Voleibol Sierra Elvira. Filtra por equipo, categoría o estado.",
};

export default async function CalendarioPage() {
  const teams = await prisma.team.findMany({
    orderBy: { name: "asc" },
  });

  const matches = await prisma.match.findMany({
    include: { team: true, sets: { orderBy: { setNumber: "asc" } } },
    orderBy: { date: "asc" },
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
    <PublicCalendarClient
      teams={teams.map((t) => ({ id: t.id, name: t.name, category: t.category }))}
      matches={serialized}
    />
  );
}
