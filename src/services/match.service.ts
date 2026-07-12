import { prisma } from "@/lib/prisma";
import { matchBus } from "@/lib/match-bus";
import { MatchStatus } from "@prisma/client";

export interface MatchSnapshot {
  id: string;
  teamId: string;
  opponent: string;
  date: Date;
  location: string;
  status: MatchStatus;
  currentSet: number;
  ourTotalSets: number;
  oppTotalSets: number;
  sets: Array<{ setNumber: number; ourPoints: number; oppPoints: number }>;
}

export async function getMatchSnapshot(matchId: string): Promise<MatchSnapshot | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { sets: { orderBy: { setNumber: "asc" } } },
  });
  if (!match) return null;
  return {
    id: match.id,
    teamId: match.teamId,
    opponent: match.opponent,
    date: match.date,
    location: match.location,
    status: match.status as MatchStatus,
    currentSet: match.currentSet,
    ourTotalSets: match.ourTotalSets,
    oppTotalSets: match.oppTotalSets,
    sets: match.sets.map((s) => ({
      setNumber: s.setNumber,
      ourPoints: s.ourPoints,
      oppPoints: s.oppPoints,
    })),
  };
}

export async function startMatch(matchId: string): Promise<MatchSnapshot | null> {
  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { status: "LIVE", currentSet: 1 },
    });

    await tx.matchSet.upsert({
      where: { matchId_setNumber: { matchId, setNumber: 1 } },
      update: {},
      create: { matchId, setNumber: 1, ourPoints: 0, oppPoints: 0 },
    });
  });

  const snapshot = await getMatchSnapshot(matchId);
  if (snapshot) matchBus.emitMatchUpdate(matchId, snapshot);
  return snapshot;
}

export async function scorePoint(
  matchId: string,
  side: "our" | "opp",
  delta: 1 | -1
): Promise<MatchSnapshot | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { status: true, currentSet: true },
  });

  if (!match || match.status !== "LIVE") return null;

  await prisma.$transaction(async (tx) => {
    const currentSet = await tx.matchSet.findUnique({
      where: { matchId_setNumber: { matchId, setNumber: match.currentSet } },
    });

    if (currentSet) {
      const newOur = Math.max(0, currentSet.ourPoints + (side === "our" ? delta : 0));
      const newOpp = Math.max(0, currentSet.oppPoints + (side === "opp" ? delta : 0));
      await tx.matchSet.update({
        where: { id: currentSet.id },
        data: { ourPoints: newOur, oppPoints: newOpp },
      });
    } else if (delta > 0) {
      await tx.matchSet.create({
        data: {
          matchId,
          setNumber: match.currentSet,
          ourPoints: side === "our" ? 1 : 0,
          oppPoints: side === "opp" ? 1 : 0,
        },
      });
    }
  });

  const snapshot = await getMatchSnapshot(matchId);
  if (snapshot) matchBus.emitMatchUpdate(matchId, snapshot);
  return snapshot;
}

export async function closeSet(matchId: string): Promise<MatchSnapshot | null> {
  const result = await prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({
      where: { id: matchId },
    });
    if (!match || match.status !== "LIVE") return null;

    const currentSetRecord = await tx.matchSet.findUnique({
      where: { matchId_setNumber: { matchId, setNumber: match.currentSet } },
    });
    if (!currentSetRecord) return null;

    const target = match.currentSet === 5 ? 15 : 25;
    const diff = Math.abs(currentSetRecord.ourPoints - currentSetRecord.oppPoints);
    if (currentSetRecord.ourPoints < target && currentSetRecord.oppPoints < target) return null;
    if (diff < 2) return null;

    const ourWon = currentSetRecord.ourPoints > currentSetRecord.oppPoints;
    const newOurTotal = match.ourTotalSets + (ourWon ? 1 : 0);
    const newOppTotal = match.oppTotalSets + (ourWon ? 0 : 1);

    const matchFinished = newOurTotal >= 3 || newOppTotal >= 3;

    await tx.match.update({
      where: { id: matchId },
      data: {
        currentSet: matchFinished ? match.currentSet : match.currentSet + 1,
        ourTotalSets: newOurTotal,
        oppTotalSets: newOppTotal,
        ...(matchFinished ? { status: "COMPLETED" as const } : {}),
      },
    });

    return matchFinished;
  });

  const snapshot = await getMatchSnapshot(matchId);
  if (snapshot) matchBus.emitMatchUpdate(matchId, snapshot);
  return snapshot;
}

export async function endMatch(matchId: string): Promise<MatchSnapshot | null> {
  await prisma.match.update({
    where: { id: matchId },
    data: { status: "COMPLETED" },
  });

  const snapshot = await getMatchSnapshot(matchId);
  if (snapshot) matchBus.emitMatchUpdate(matchId, snapshot);
  return snapshot;
}
