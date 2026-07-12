import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, getCurrentMonthLabel, getLastSixMonths, getMonthShortLabel } from "@/lib/utils";
import { DashboardUserTable } from "./_dashboard-user-table";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const currentMonth = getCurrentMonthLabel();

  const totalIncome = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { month: currentMonth },
  });

  const totalPlayers = await prisma.user.count({ where: { role: "PLAYER" } });
  const totalTeams = await prisma.team.count();

  const completedMatches = await prisma.match.findMany({
    where: { status: "COMPLETED" },
    select: { ourTotalSets: true, oppTotalSets: true },
  });

  let wins = 0;
  let losses = 0;
  completedMatches.forEach((m) => {
    if (m.ourTotalSets > m.oppTotalSets) wins++;
    else losses++;
  });
  const totalMatches = wins + losses;
  const winRatio = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const lastSix = getLastSixMonths();
  const incomeByMonthRaw = await prisma.payment.groupBy({
    by: ["month"],
    where: { month: { in: lastSix } },
    _sum: { amount: true },
  });
  const incomeByMonthMap = new Map(incomeByMonthRaw.map((r) => [r.month, r._sum.amount ?? 0]));
  const maxIncome = Math.max(...lastSix.map((m) => incomeByMonthMap.get(m) ?? 0), 1);

  const paidPlayerIds = await prisma.payment.findMany({
    where: { month: currentMonth },
    select: { playerId: true },
  });
  const uniquePaidCount = new Set(paidPlayerIds.map((p) => p.playerId)).size;
  const collectionRate = totalPlayers > 0 ? Math.round((uniquePaidCount / totalPlayers) * 100) : 0;

  const unassignedPlayers = await prisma.user.count({
    where: { role: "PLAYER", memberships: { none: {} } },
  });

  const defaulters = await prisma.$queryRaw<Array<{ name: string; email: string }>>`
    SELECT u.name, u.email
    FROM "User" u
    JOIN "TeamMember" tm ON tm."userId" = u.id AND tm."roleInTeam" = 'PLAYER'
    WHERE NOT EXISTS (
      SELECT 1 FROM "Payment" p
      WHERE p."playerId" = u.id AND p.month = ${currentMonth}
    )
    ORDER BY u.name
  `;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      memberships: {
        include: { team: true },
        take: 1,
      },
    },
  });

  function formatYAxisLabel(value: number): string {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return String(value);
  }

  const incomeStep = Math.ceil(maxIncome / 4 / 1000) * 1000 || 1000;
  const yLabels = [0, 1, 2, 3, 4].map((i) => incomeStep * i);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-display text-display-xl text-on-surface mb-xs">Centro de Control</h1>
          <p className="font-sans text-body-lg text-on-surface-variant">Visión general de operaciones del club, finanzas y gestión de usuarios.</p>
        </div>
        <a
          href={`/api/admin/export/payments?month=${encodeURIComponent(currentMonth)}`}
          download
          className="bg-surface-container-high text-on-surface font-sans text-label-bold px-md py-sm rounded border border-outline-variant hover:border-primary hover:text-primary transition-colors flex items-center gap-xs"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Exportar CSV
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
        {/* KPI: Active Players */}
        <div className="col-span-1 md:col-span-4 card-bg border border-solid card-border rounded-lg p-md relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 text-surface-container-highest opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500">
            <span className="material-symbols-outlined text-9xl">groups</span>
          </div>
          <div className="relative z-10">
            <p className="font-sans text-label-bold text-on-surface-variant uppercase tracking-wider mb-sm">Jugadores Activos</p>
            <div className="flex items-baseline gap-sm">
              <h3 className="font-display text-display-xl text-on-surface">{totalPlayers}</h3>
            </div>
            <p className="font-sans text-label-sm text-on-surface-variant mt-sm">En {totalTeams} equipos</p>
          </div>
        </div>

        {/* KPI: Monthly Revenue */}
        <div className="col-span-1 md:col-span-4 card-bg border border-solid card-border border-l-2 border-l-primary rounded-lg p-md relative overflow-hidden group shadow-[inset_4px_0_0_0_#ff7a21]">
          <div className="absolute -right-8 -top-8 text-surface-container-highest opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500">
            <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <p className="font-sans text-label-bold text-on-surface-variant uppercase tracking-wider mb-sm">Ingresos Mensuales</p>
            <div className="flex items-baseline gap-sm">
              <h3 className="font-display text-display-xl text-on-surface">{formatCurrency(totalIncome._sum.amount ?? 0)}</h3>
            </div>
            <p className="font-sans text-label-sm text-on-surface-variant mt-sm">{collectionRate}% tasa de cobro</p>
          </div>
        </div>

        {/* KPI: Season Win Ratio */}
        <div className="col-span-1 md:col-span-4 card-bg border border-solid card-border rounded-lg p-md relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 text-surface-container-highest opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500">
            <span className="material-symbols-outlined text-9xl">emoji_events</span>
          </div>
          <div className="relative z-10">
            <p className="font-sans text-label-bold text-on-surface-variant uppercase tracking-wider mb-sm">Ratio Victorias (Temporada)</p>
            <div className="flex items-baseline gap-sm">
              <h3 className="font-display text-display-xl text-on-surface">{winRatio}%</h3>
            </div>
            <div className="mt-sm w-full bg-surface-container-highest h-2 rounded-full overflow-hidden flex">
              <div className="bg-primary h-full" style={{ width: `${winRatio}%` }} />
              <div className="bg-error h-full" style={{ width: `${100 - winRatio}%` }} />
            </div>
            <div className="flex justify-between mt-xs font-sans text-label-sm text-on-surface-variant">
              <span>{wins} Victorias</span>
              <span>{losses} Derrotas</span>
            </div>
          </div>
        </div>

        {/* Financial Overview Chart */}
        <div className="col-span-1 md:col-span-8 card-bg border border-solid card-border rounded-lg p-md flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-display text-headline-md text-on-surface">Resumen Financiero</h3>
            <select className="bg-surface text-on-surface border border-outline-variant rounded px-sm py-xs font-sans text-label-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              <option>Últimos 12 Meses</option>
              <option>Últimos 6 Meses</option>
            </select>
          </div>

          <div className="flex-1 min-h-[220px] relative flex items-end gap-1 py-sm">
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-on-surface-variant font-sans text-label-sm py-sm pr-sm border-r border-outline-variant/30 min-w-[32px]">
              {yLabels
                .slice()
                .reverse()
                .map((v) => (
                  <span key={v}>{formatYAxisLabel(v)}</span>
                ))}
            </div>

            <div className="ml-10 flex-1 h-full flex items-end justify-between gap-1">
              {lastSix.map((month) => {
                const income = incomeByMonthMap.get(month) ?? 0;
                const barHeight = maxIncome > 0 ? (income / maxIncome) * 100 : 0;
                return (
                  <div key={month} className="flex flex-col items-center gap-1 w-full group">
                    <div className="w-full flex items-end gap-0.5" style={{ height: "180px" }}>
                      <div
                        className="w-full bg-primary/80 group-hover:bg-primary transition-colors rounded-t-sm"
                        style={{ height: `${Math.max(barHeight, 2)}%` }}
                      />
                    </div>
                    <span className="font-sans text-label-sm text-on-surface-variant">{getMonthShortLabel(month)}</span>
                  </div>
                );
              })}
            </div>

            <div className="absolute top-0 right-0 flex gap-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-primary/80 rounded-sm" />
                <span className="font-sans text-label-sm text-on-surface-variant">Ingresos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="col-span-1 md:col-span-4 card-bg border border-solid card-border rounded-lg p-md flex flex-col">
          <h3 className="font-display text-headline-md text-on-surface mb-md">Alertas del Sistema</h3>
          <div className="flex-1 overflow-y-auto pr-sm space-y-sm">
            {defaulters.length > 0 && (
              <div className="bg-surface-container p-sm rounded border-l-2 border-l-error flex gap-sm items-start">
                <span className="material-symbols-outlined text-error mt-0.5 text-[20px]">warning</span>
                <div>
                  <p className="font-sans text-label-bold text-on-surface">Cuotas Pendientes</p>
                  <p className="font-sans text-body-md text-sm text-on-surface-variant">
                    {defaulters.length} jugadore{defaulters.length !== 1 ? "s" : ""} con pago{defaulters.length !== 1 ? "s" : ""} atrasado{defaulters.length !== 1 ? "" : ""} &gt; 30 días.
                  </p>
                </div>
              </div>
            )}

            {unassignedPlayers > 0 && (
              <div className="bg-surface-container p-sm rounded border-l-2 border-l-primary flex gap-sm items-start">
                <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">campaign</span>
                <div>
                  <p className="font-sans text-label-bold text-on-surface">Nuevas Inscripciones</p>
                  <p className="font-sans text-body-md text-sm text-on-surface-variant">
                    {unassignedPlayers} jugadore{unassignedPlayers !== 1 ? "s" : ""} nuev{unassignedPlayers !== 1 ? "os" : "o"} esperando asignación a equipo.
                  </p>
                </div>
              </div>
            )}

            {defaulters.length === 0 && unassignedPlayers === 0 && (
              <div className="bg-surface-container p-sm rounded border border-outline-variant flex gap-sm items-start opacity-70">
                <span className="material-symbols-outlined text-on-surface-variant mt-0.5 text-[20px]">done_all</span>
                <div>
                  <p className="font-sans text-label-bold text-on-surface">Todo Correcto</p>
                  <p className="font-sans text-body-md text-sm text-on-surface-variant">No se detectaron incidencias.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Management Table */}
        <div className="col-span-1 md:col-span-12">
          <DashboardUserTable
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              teamName: u.memberships[0]?.team.name ?? null,
              paidThisMonth: paidPlayerIds.some((p) => p.playerId === u.id),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
