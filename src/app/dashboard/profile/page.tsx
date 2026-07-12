import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: { include: { team: true } },
    },
  });

  if (!user) throw new Error("Usuario no encontrado");

  const teamId = user.memberships[0]?.teamId ?? null;

  const payments = await prisma.payment.findMany({
    where: { playerId: userId },
    orderBy: { paidAt: "desc" },
  });

  const rosters = await prisma.roster.findMany({
    where: { playerId: userId },
    include: {
      match: {
        include: { sets: true },
      },
    },
    orderBy: { match: { date: "desc" } },
  });

  const completedRosters = rosters.filter((r) => r.match.status === "COMPLETED");
  const wins = completedRosters.filter(
    (r) => r.match.ourTotalSets > r.match.oppTotalSets
  ).length;
  const totalCalled = rosters.length;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const latestPayment = payments[0];
  const team = user.memberships[0]?.team ?? null;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="font-display text-display-xl text-on-surface">Mi Perfil</h1>
        <p className="font-sans text-body-lg text-on-surface-variant mt-1">
          Tu información personal y estado en el club.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-md">
        {/* Identity card */}
        <div className="md:col-span-4 card-bg border border-solid card-border rounded-xl p-md flex flex-col items-center gap-sm text-center">
          <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-3xl font-display font-black text-on-secondary-container border-2 border-primary mt-2">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-headline-md text-on-surface">{user.name}</h2>
            <p className="font-sans text-body-md text-on-surface-variant">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-sans font-bold text-label-sm uppercase tracking-wider">
              {user.role === "PLAYER" ? "Jugador" : user.role === "COACH" ? "Entrenador" : "Admin"}
            </span>
          </div>
          {team && (
            <div className="w-full mt-2 bg-surface-container rounded-lg p-sm border border-outline-variant text-left">
              <p className="font-sans text-label-sm text-on-surface-variant">Equipo</p>
              <p className="font-sans font-bold text-label-bold text-on-surface">{team.name}</p>
              <p className="font-sans text-label-sm text-on-surface-variant">{team.category}</p>
            </div>
          )}
          <p className="font-sans text-label-sm text-on-surface-variant">
            Miembro desde {formatDate(user.createdAt)}
          </p>
        </div>

        {/* Stats */}
        <div className="md:col-span-8 flex flex-col gap-md">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-sm">
            <div className="card-bg border border-solid card-border rounded-xl p-sm text-center">
              <p className="font-display font-black text-2xl text-primary">{totalCalled}</p>
              <p className="font-sans text-label-sm text-on-surface-variant mt-1">Convocatorias</p>
            </div>
            <div className="card-bg border border-solid card-border rounded-xl p-sm text-center">
              <p className="font-display font-black text-2xl text-[#2DFF8E]">{wins}</p>
              <p className="font-sans text-label-sm text-on-surface-variant mt-1">Victorias</p>
            </div>
            <div className="card-bg border border-solid card-border rounded-xl p-sm text-center">
              <p className="font-display font-black text-2xl text-primary">{formatCurrency(totalPaid)}</p>
              <p className="font-sans text-label-sm text-on-surface-variant mt-1">Total Pagado</p>
            </div>
          </div>

          {/* Financial status */}
          <div className="card-bg border border-solid card-border rounded-xl p-md">
            <div className="flex items-center justify-between mb-sm">
              <h3 className="font-display text-headline-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">payments</span>
                Estado de Pagos
              </h3>
              <span className={`px-3 py-1 rounded-full font-sans font-bold text-label-sm uppercase tracking-wider ${
                latestPayment ? "bg-[#2DFF8E]/20 text-[#2DFF8E]" : "bg-[#FF4B4B]/20 text-[#FF4B4B]"
              }`}>
                {latestPayment ? "Al Día" : "Pendiente"}
              </span>
            </div>
            <div className="overflow-y-auto max-h-52 space-y-2 pr-1">
              {payments.length === 0 ? (
                <p className="font-sans text-body-md text-on-surface-variant">Sin pagos registrados.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-2 border-b border-outline-variant last:border-0">
                    <span className="font-sans text-body-md text-on-surface">{p.month}</span>
                    <span className="font-sans font-bold text-label-bold text-[#2DFF8E]">{formatCurrency(Number(p.amount))}</span>
                    <span className="font-sans text-label-sm text-on-surface-variant">{formatDate(p.paidAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Match history */}
      <div className="card-bg border border-solid card-border rounded-xl overflow-hidden">
        <div className="p-md border-b border-outline-variant flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">history</span>
          <h3 className="font-display text-headline-md text-on-surface">Historial de Partidos</h3>
          <span className="font-sans text-label-sm text-on-surface-variant ml-auto">{completedRosters.length} partidos jugados</span>
        </div>
        <div className="overflow-x-auto">
          {completedRosters.length === 0 ? (
            <div className="p-md text-center">
              <p className="font-sans text-body-md text-on-surface-variant">No has jugado aún ningún partido.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container text-left">
                  <th className="py-sm px-md font-sans font-bold text-label-bold text-on-surface-variant">Rival</th>
                  <th className="py-sm px-md font-sans font-bold text-label-bold text-on-surface-variant">Fecha</th>
                  <th className="py-sm px-md font-sans font-bold text-label-bold text-on-surface-variant">Resultado</th>
                  <th className="py-sm px-md font-sans font-bold text-label-bold text-on-surface-variant">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {completedRosters.map((r) => {
                  const won = r.match.ourTotalSets > r.match.oppTotalSets;
                  return (
                    <tr key={r.id} className="border-b border-outline-variant hover:bg-surface-container-high transition-colors last:border-0">
                      <td className="py-sm px-md font-sans text-body-md text-on-surface font-medium">{r.match.opponent}</td>
                      <td className="py-sm px-md font-sans text-body-md text-on-surface-variant">{formatDate(r.match.date)}</td>
                      <td className="py-sm px-md">
                        <span className={`inline-block px-2 py-0.5 rounded font-sans font-bold text-[11px] uppercase tracking-wider ${
                          won ? "bg-[#2DFF8E]/20 text-[#2DFF8E]" : "bg-[#FF4B4B]/20 text-[#FF4B4B]"
                        }`}>
                          {r.match.ourTotalSets}-{r.match.oppTotalSets} {won ? "V" : "D"}
                        </span>
                      </td>
                      <td className="py-sm px-md">
                        <span className={`inline-block px-2 py-0.5 rounded font-sans font-bold text-[11px] uppercase tracking-wider ${
                          r.status === "CONFIRMED"
                            ? "bg-[#2DFF8E]/20 text-[#2DFF8E]"
                            : r.status === "DECLINED"
                            ? "bg-[#FF4B4B]/20 text-[#FF4B4B]"
                            : "bg-surface-container-highest text-on-surface-variant"
                        }`}>
                          {r.status === "CONFIRMED" ? "Confirmada" : r.status === "DECLINED" ? "Declinada" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
