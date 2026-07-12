import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatShortDate, formatTime } from "@/lib/utils";
import { AttendanceButtons } from "./attendance-buttons";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function PlayerDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;

  const membership = await prisma.teamMember.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          members: {
            where: { roleInTeam: { in: ["MAIN_COACH", "SEC_COACH"] } },
            include: { user: true },
          },
        },
      },
    },
  });

  const payments = await prisma.payment.findMany({
    where: { playerId: userId },
    orderBy: { paidAt: "desc" },
    take: 5,
  });

  const teamId = membership?.teamId;

  const completedMatches = teamId
    ? await prisma.match.findMany({
        where: { teamId, status: "COMPLETED" },
        include: { sets: true, roster: { where: { playerId: userId } } },
        orderBy: { date: "desc" },
        take: 3,
      })
    : [];

  const upcomingMatch = teamId
    ? await prisma.match.findFirst({
        where: { teamId, status: "SCHEDULED", date: { gte: new Date() } },
        include: { roster: { where: { playerId: userId } } },
        orderBy: { date: "asc" },
      })
    : null;

  const liveMatch = teamId
    ? await prisma.match.findFirst({
        where: { teamId, status: "LIVE" },
        include: { sets: { orderBy: { setNumber: "asc" } } },
      })
    : null;

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [{ targetTeamId: null }, ...(teamId ? [{ targetTeamId: teamId }] : [])],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const rosterEntry = upcomingMatch?.roster?.[0];
  const isUpcomingCalledUp = !!rosterEntry;
  const attendanceStatus = rosterEntry?.status ?? "PENDING";
  const filteredPayments = payments.filter((p) => p.paidAt !== null);
  const latestPayment = filteredPayments[0];
  const totalPaid = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-headline-lg-mobile md:text-display-xl text-primary">Inicio</h1>
        <Link
          href="/dashboard/matches"
          className="flex items-center gap-1 bg-primary text-on-primary font-sans text-label-sm px-3 py-1.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all"
        >
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          Mis Partidos
        </Link>
      </div>

      {/* Global Notifications Alert */}
      {announcements.length > 0 && (
        <div className="mb-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="mb-4 bg-surface-container border-l-4 border-primary p-4 rounded-lg flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-primary mt-1">campaign</span>
              <div>
                <h3 className="font-sans font-bold text-label-bold text-on-surface">{a.title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">{a.content}</p>
                <p className="font-sans text-label-sm text-on-surface-variant mt-2">{formatDate(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live match banner */}
      {liveMatch && (
        <a
          href={`/matches/${liveMatch.id}`}
          className="block bg-surface-container border-l-4 border-primary p-4 rounded-lg hover:bg-[#2A2A2A] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#FF4B4B] animate-pulse" />
            <span className="font-sans font-bold text-label-bold text-[#FF4B4B] uppercase tracking-widest">En Directo</span>
            <span className="font-sans text-body-md text-on-surface ml-2">
              {liveMatch.opponent} — {liveMatch.ourTotalSets}-{liveMatch.oppTotalSets}
            </span>
          </div>
        </a>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        
        {/* Next Match Card (Spans full width on mobile, 8 cols on desktop) */}
        <div className="md:col-span-8 card-bg border border-solid card-border rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
          <div className="flex justify-between items-start mb-4 pl-4">
            <div>
              <h2 className="font-display font-semibold text-headline-md text-primary mb-1">Próximo Partido</h2>
              <p className="font-sans font-bold text-label-bold text-on-surface-variant">
                {membership?.team?.category ?? "Sin equipo actual"}
              </p>
            </div>
            {upcomingMatch && (
              <div className="bg-surface-container-high px-3 py-1 rounded-md text-center">
                <span className="block font-sans font-bold text-label-bold text-primary uppercase">
                  {formatShortDate(upcomingMatch.date).substring(0, 3)}
                </span>
                <span className="block font-display font-semibold text-headline-md text-on-surface">
                  {new Date(upcomingMatch.date).getDate()}
                </span>
              </div>
            )}
          </div>

          {upcomingMatch ? (
            <div className="pl-4 flex flex-col md:flex-row md:items-center justify-between mt-6 gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-2 mx-auto">
                    <span className="material-symbols-outlined text-3xl text-primary">shield</span>
                  </div>
                  <span className="font-sans font-bold text-label-bold text-on-surface block">Sierra Elvira</span>
                </div>
                <div className="font-display font-semibold text-headline-md text-on-surface-variant">VS</div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-2 mx-auto">
                    <span className="material-symbols-outlined text-3xl text-tertiary">sports_volleyball</span>
                  </div>
                  <span className="font-sans font-bold text-label-bold text-on-surface block">{upcomingMatch.opponent}</span>
                </div>
              </div>
              <div className="space-y-3 flex-1 md:ml-8">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span className="font-sans text-body-md">{formatTime(upcomingMatch.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <span className="font-sans text-body-md">{upcomingMatch.location}</span>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  <span
                    className={`inline-block w-fit px-3 py-1 rounded-md font-sans text-label-bold font-bold text-[12px] uppercase tracking-wider ${
                      isUpcomingCalledUp
                        ? attendanceStatus === "CONFIRMED"
                          ? "bg-[#2DFF8E] text-black"
                          : attendanceStatus === "DECLINED"
                          ? "bg-[#FF4B4B] text-white"
                          : "bg-surface-container-highest text-on-surface"
                        : "bg-[#FF4B4B] text-white"
                    }`}
                  >
                    {!isUpcomingCalledUp
                      ? "✕ No Convocado"
                      : attendanceStatus === "CONFIRMED"
                      ? "✓ Convocado (Confirmado)"
                      : attendanceStatus === "DECLINED"
                      ? "✕ Convocado (Declinado)"
                      : "? Convocado (Pendiente)"}
                  </span>
                  {isUpcomingCalledUp && (
                    <AttendanceButtons matchId={upcomingMatch.id} initialStatus={attendanceStatus} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="pl-4 font-sans text-body-md text-on-surface-variant mt-4 flex flex-col items-center gap-2 py-6">
              <span className="material-symbols-outlined text-4xl text-outline">calendar_month</span>
              <p>No hay próximos partidos programados</p>
              <p className="font-sans text-label-sm text-on-surface-variant">Los partidos aparecerán aquí cuando tu entrenador los programe.</p>
            </div>
          )}
        </div>

        {/* Financial Status Card (Spans full width on mobile, 4 cols on desktop) */}
        <div className="md:col-span-4 card-bg border border-solid card-border rounded-xl p-6 flex flex-col">
          <h2 className="font-display font-semibold text-headline-md text-on-surface mb-4">Estado Financiero</h2>
          <div className="flex items-center justify-between mb-6">
            <span className="font-sans text-body-md text-on-surface-variant">Cuota Mensual</span>
            <span className={`px-3 py-1 rounded-md font-sans font-bold text-label-sm ${
              latestPayment ? "bg-[#2DFF8E] text-black" : "bg-[#FF4B4B] text-white"
            }`}>
              {latestPayment ? "AL DÍA" : "PENDIENTE"}
            </span>
          </div>
          <div className="text-center mb-6 py-4 bg-surface-container-lowest rounded-lg border border-surface-container">
            <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Abonado</p>
            <p className="font-display font-black text-3xl text-primary">{formatCurrency(totalPaid)}</p>
          </div>
          <h3 className="font-sans font-bold text-label-bold text-on-surface mb-3 border-b border-outline-variant pb-2">Últimos Pagos</h3>
          <ul className="space-y-3 flex-1">
            {filteredPayments.slice(0, 3).map((p) => (
              <li key={p.id} className="flex justify-between items-center font-sans text-body-md">
                <span className="text-on-surface">{p.month}</span>
                <span className="text-[#2DFF8E] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Pagado
                </span>
              </li>
            ))}
            {filteredPayments.length === 0 && (
              <li className="flex flex-col items-center gap-2 py-4 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl text-outline">payments</span>
                <p className="font-sans text-body-md">Sin pagos registrados</p>
                <p className="font-sans text-label-sm text-center">Los pagos aparecerán aquí cuando tu entrenador o administrador los registre.</p>
              </li>
            )}
          </ul>
        </div>

        {/* Recent Matches Summary */}
        <div className="md:col-span-12 card-bg border border-solid card-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-semibold text-headline-md text-on-surface">Últimos Partidos</h2>
            <Link
              href="/dashboard/matches"
              className="font-sans text-label-sm text-primary hover:text-primary-container transition-colors flex items-center gap-1"
            >
              Ver todos
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          {completedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedMatches.map((m) => {
                const ourSets = m.sets.filter((s) => s.ourPoints > s.oppPoints).length;
                const oppSets = m.sets.filter((s) => s.oppPoints > s.ourPoints).length;
                const won = ourSets > oppSets;
                return (
                  <div
                    key={m.id}
                    className="bg-surface-container p-4 rounded-lg border border-surface-container hover:bg-[#2A2A2A] transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant mb-1">{formatShortDate(m.date)}</p>
                      <p className="font-sans font-bold text-label-bold text-on-surface">vs {m.opponent}</p>
                    </div>
                    <div className="text-right">
                      <span className={`block font-display font-semibold text-headline-md ${won ? "text-[#2DFF8E]" : "text-[#FF4B4B]"}`}>
                        {ourSets} - {oppSets}
                      </span>
                      <span className="font-sans text-label-sm text-on-surface-variant uppercase">
                        {won ? "Victoria" : "Derrota"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8">
              <span className="material-symbols-outlined text-4xl text-outline">sports_volleyball</span>
              <p className="font-sans text-body-md text-on-surface-variant">Aún no hay partidos registrados</p>
              <p className="font-sans text-label-sm text-on-surface-variant">Los resultados aparecerán aquí cuando se disputen los primeros partidos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
