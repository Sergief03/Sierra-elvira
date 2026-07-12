import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentMonthLabel, formatShortDate, formatTime } from "@/lib/utils";
import { RecordPaymentForm } from "./record-payment-form";

export const dynamic = 'force-dynamic';

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id, teamId, roleInTeam: { in: ["MAIN_COACH", "SEC_COACH"] } },
    include: { team: true },
  });

  if (!membership && session.user.role !== "SUPER_ADMIN") notFound();

  const team = membership?.team ?? (await prisma.team.findUnique({ where: { id: teamId } }));
  if (!team) notFound();

  const players = await prisma.teamMember.findMany({
    where: { teamId, roleInTeam: "PLAYER" },
    include: { user: true },
  });

  const currentMonth = getCurrentMonthLabel();

  const matches = await prisma.match.findMany({
    where: { teamId },
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h1 className="font-display text-display-xl text-on-surface">{team.name}</h1>
          <p className="font-sans text-body-lg text-on-surface-variant">{team.category}</p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <Link
            href={`/coach/teams/${teamId}/matches/new`}
            className="bg-primary text-on-primary font-sans text-label-bold px-md py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Partido
          </Link>
          <Link
            href={`/coach/teams/${teamId}/announcements`}
            className="bg-surface-container-high text-on-surface font-sans text-label-bold px-md py-sm rounded-lg border border-outline-variant hover:border-primary transition-colors flex items-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            Comunicado
          </Link>
        </div>
      </div>

      {/* Players Table */}
      <section className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-md border-b border-outline-variant bg-surface-container flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">engineering</span>
            <h3 className="font-display text-headline-md text-on-surface">Plantilla</h3>
          </div>
          <div className="flex gap-sm">
            <span className="flex items-center gap-1 bg-surface border border-outline-variant rounded px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span className="font-sans text-label-sm text-on-surface">Pagado</span>
            </span>
            <span className="flex items-center gap-1 bg-surface border border-outline-variant rounded px-2 py-0.5">
              <span className="w-2 h-2 rounded-full bg-danger"></span>
              <span className="font-sans text-label-sm text-on-surface">Pendiente</span>
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {players.length === 0 ? (
            <p className="p-4 font-sans text-body-md text-on-surface-variant">No hay jugadores en este equipo.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-highest">
                  <th className="text-left p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Jugador</th>
                  <th className="text-left p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Email</th>
                  <th className="text-center p-3 font-sans text-label-bold text-on-surface-variant uppercase tracking-wider">Estado {currentMonth}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {players.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center font-sans text-label-bold text-on-secondary-container">
                          {member.user.name?.charAt(0)}
                        </div>
                        <span className="font-sans text-body-md text-on-surface">{member.user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-sans text-body-md text-on-surface-variant">{member.user.email}</td>
                    <td className="p-3 text-center">
                      <RecordPaymentForm
                        playerId={member.user.id}
                        coachId={session.user.id}
                        month={currentMonth}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Matches */}
      <section className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden">
        <div className="p-md border-b border-outline-variant bg-surface-container">
          <h3 className="font-display text-headline-md text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">sports_volleyball</span>
            Partidos
          </h3>
        </div>
        <div className="divide-y divide-outline-variant">
          {matches.length === 0 ? (
            <p className="p-4 font-sans text-body-md text-on-surface-variant">No hay partidos registrados.</p>
          ) : (
            matches.map((m) => (
              <div key={m.id} className="p-4 hover:bg-surface-container-high transition-colors flex items-center justify-between">
                <div>
                  <p className="font-display text-headline-md text-on-surface">{m.opponent}</p>
                  <p className="font-sans text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {formatShortDate(m.date)} — {formatTime(m.date)} — {m.location}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-sans text-label-bold ${m.status === "LIVE" ? "text-danger" : m.status === "SCHEDULED" ? "text-primary" : "text-on-surface-variant"}`}>
                    {m.status === "LIVE" && "En Directo"}
                    {m.status === "SCHEDULED" && "Programado"}
                    {m.status === "COMPLETED" && `${m.ourTotalSets}-${m.oppTotalSets}`}
                  </span>
                  {m.status === "LIVE" && (
                    <Link href={`/coach/matches/${m.id}/live`}
                      className="px-3 py-1 bg-danger/20 text-danger font-sans text-label-bold rounded-md text-sm hover:bg-danger/30 transition-colors">
                      Control
                    </Link>
                  )}
                  {m.status === "SCHEDULED" && (
                    <Link href={`/coach/teams/${teamId}/matches/${m.id}/roster`}
                      className="px-3 py-1 bg-primary/20 text-primary font-sans text-label-bold rounded-md text-sm hover:bg-primary/30 transition-colors">
                      Convocatoria
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
