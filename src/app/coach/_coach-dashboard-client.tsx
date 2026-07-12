"use client";

import { useState, useActionState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAnnouncement } from "@/actions/announcement.actions";
import { toggleRosterPlayer } from "@/actions/roster.actions";
import { RecordPaymentForm } from "./teams/[teamId]/record-payment-form";
import { getTeamRoleLabel } from "@/lib/utils";
import { toast } from "sonner";
import { MatchCalendar } from "@/components/match-calendar";

interface TeamMembership {
  teamId: string;
  teamName: string;
  teamCategory: string;
  roleInTeam: string;
}

interface Player {
  id: string;
  name: string;
  email: string;
}

interface NextMatch {
  id: string;
  opponent: string;
  date: string;
  location: string;
  rosterPlayerIds: string[];
}

interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string;
  status: string;
}

interface Props {
  memberships: TeamMembership[];
  playersByTeam: Record<string, Player[]>;
  paidPlayers: string[];
  paymentAmounts: Record<string, number>;
  nextMatchByTeam: Record<string, NextMatch | null>;
  allMatchesByTeam: Record<string, Match[]>;
  currentMonth: string;
  coachId: string;
}

function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} · ${time}h`;
}

export function CoachDashboardClient({
  memberships,
  playersByTeam,
  paidPlayers,
  paymentAmounts,
  nextMatchByTeam,
  allMatchesByTeam,
  currentMonth,
  coachId,
}: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState(memberships[0]?.teamId ?? "");
  const router = useRouter();
  const now = new Date();

  const selectedMembership = memberships.find((m) => m.teamId === selectedTeamId);
  const teamPlayers = playersByTeam[selectedTeamId] ?? [];
  const nextMatch = nextMatchByTeam[selectedTeamId] ?? null;
  const allMatches = allMatchesByTeam[selectedTeamId] ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-sm">
        <div>
          <h1 className="font-display text-display-xl text-on-surface">Panel de Entrenador</h1>
          <p className="font-sans text-body-lg text-on-surface-variant mt-1">Gestión táctica y administrativa de equipos asignados.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link
            href={`/coach/matches`}
            className="w-full md:w-auto bg-surface-container border border-outline-variant text-on-surface font-sans text-label-bold px-md py-sm rounded flex items-center justify-center gap-sm hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-sm">list</span>
            Todos los Partidos
          </Link>
          <Link
            href={selectedTeamId ? `/coach/teams/${selectedTeamId}/matches/new` : "#"}
            className={`w-full md:w-auto bg-primary text-on-primary font-sans text-label-bold px-md py-sm rounded flex items-center justify-center gap-sm hover:scale-[0.98] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(255,182,144,0.15)] group ${!selectedTeamId ? "opacity-50 pointer-events-none" : ""}`}
          >
            <span className="material-symbols-outlined group-hover:animate-pulse">sports_score</span>
            Nuevo Partido
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-md">

        {/* Column 1: Mis Equipos + Comunicado (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-md">

          {/* Mis Equipos */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden flex flex-col h-[300px]">
            <div className="p-sm border-b border-outline-variant bg-surface-container flex items-center justify-between">
              <h3 className="font-display text-headline-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary">groups</span>
                Mis Equipos
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-xs space-y-xs">
              {memberships.map((m) => {
                const isActive = m.teamId === selectedTeamId;
                return (
                  <button
                    key={m.teamId}
                    onClick={() => setSelectedTeamId(m.teamId)}
                    className={`w-full text-left p-sm rounded cursor-pointer group transition-all ${
                      isActive
                        ? "bg-surface-container-high border-l-2 border-primary"
                        : "bg-transparent border border-transparent hover:bg-surface-container-high hover:border-outline-variant"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-sans text-label-bold ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}>
                        {m.teamName}
                      </h4>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold ${
                        isActive ? "bg-surface-variant text-on-surface" : "bg-surface-container-highest text-on-surface-variant"
                      }`}>
                        {m.teamCategory}
                      </span>
                    </div>
                    <p className={`font-sans text-label-sm flex items-center gap-1 ${
                      isActive ? "text-primary" : "text-on-surface-variant"
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {isActive ? "star" : "person_check"}
                      </span>
                      {getTeamRoleLabel(m.roleInTeam)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Comunicado al Equipo */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex-1">
            <h3 className="font-display text-headline-md text-on-surface mb-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary">campaign</span>
              Comunicado al Equipo
            </h3>
            <p className="font-sans text-label-sm text-on-surface-variant mb-md">
              {selectedMembership
                ? `Enviar notificación directa a todos los miembros de ${selectedMembership.teamName}.`
                : "Selecciona un equipo para enviar un comunicado."}
            </p>
            {selectedMembership && (
              <AnnouncementFormInline teamId={selectedTeamId} />
            )}
          </section>
        </div>

        {/* Column 2: Plantilla + Próximo Partido (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-md">

          {/* Plantilla */}
          <section className="bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-md border-b border-outline-variant bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
              <div>
                <h3 className="font-display text-headline-md text-on-surface flex items-center gap-xs">
                  <span className="material-symbols-outlined text-primary">engineering</span>
                  Plantilla{selectedMembership ? `: ${selectedMembership.teamName}` : ""}
                </h3>
                <p className="font-sans text-label-sm text-on-surface-variant mt-1">Gestión de estado financiero y deportivo.</p>
              </div>
              <div className="flex gap-sm">
                <div className="bg-surface border border-outline-variant rounded px-sm py-xs flex items-center gap-xs">
                  <span className="w-2 h-2 rounded-full bg-[#2DFF8E]" />
                  <span className="font-sans font-bold text-label-sm text-on-surface">Pagado</span>
                </div>
                <div className="bg-surface border border-outline-variant rounded px-sm py-xs flex items-center gap-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FF4B4B]" />
                  <span className="font-sans font-bold text-label-sm text-on-surface">Pendiente</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              {teamPlayers.length === 0 ? (
                <p className="p-4 font-sans text-body-md text-on-surface-variant">Sin jugadores en este equipo.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-highest">
                      <th className="py-sm px-md font-sans text-label-bold text-on-surface-variant whitespace-nowrap">Jugador</th>
                      <th className="py-sm px-md font-sans text-label-bold text-on-surface-variant whitespace-nowrap">Email</th>
                      <th className="py-sm px-md font-sans text-label-bold text-on-surface-variant whitespace-nowrap">Estado Mensualidad</th>
                      <th className="py-sm px-md font-sans text-label-bold text-on-surface-variant text-right whitespace-nowrap">Abonado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {teamPlayers.map((player) => {
                      const isPaid = paidPlayers.includes(player.id);
                      const amount = paymentAmounts[player.id] ?? 0;
                      return (
                        <tr key={player.id} className="hover:bg-surface-container-high transition-colors group">
                          <td className="py-sm px-md">
                            <div className="flex items-center gap-sm">
                              <div className="w-8 h-8 rounded bg-surface border border-outline overflow-hidden flex items-center justify-center font-sans text-label-bold text-on-surface">
                                {player.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-sans text-body-md text-on-surface font-medium">{player.name}</span>
                            </div>
                          </td>
                          <td className="py-sm px-md font-sans text-body-md text-on-surface-variant">{player.email}</td>
                          <td className="py-sm px-md">
                            {isPaid ? (
                              <span className="inline-block bg-[#2DFF8E] text-black px-2 py-0.5 rounded font-sans font-bold text-label-bold text-[11px] uppercase tracking-wider">
                                Al Corriente
                              </span>
                            ) : (
                              <span className="inline-block bg-[#FF4B4B] text-white px-2 py-0.5 rounded font-sans font-bold text-label-bold text-[11px] uppercase tracking-wider">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="py-sm px-md text-right">
                            <RecordPaymentForm
                              playerId={player.id}
                              coachId={coachId}
                              month={currentMonth}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Próximo Partido & Convocatoria */}
          {nextMatch ? (
            <UpcomingMatchCard match={nextMatch} players={teamPlayers} paidPlayers={new Set(paidPlayers)} />
          ) : (
            <section className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
              <div className="flex flex-col items-center gap-2 py-4">
                <span className="material-symbols-outlined text-4xl text-outline">sports_volleyball</span>
                <p className="font-sans text-body-md text-on-surface-variant">Sin partidos programados.</p>
                {selectedTeamId && (
                  <Link
                    href={`/coach/teams/${selectedTeamId}/matches/new`}
                    className="mt-2 bg-primary text-on-primary font-sans text-label-bold px-md py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all"
                  >
                    Crear Partido
                  </Link>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Match Calendar for selected team */}
      <MatchCalendar
        matches={allMatches}
        year={now.getFullYear()}
        month={now.getMonth()}
        buildMatchLink={(m) => `/matches/${m.id}`}
      />
    </div>
  );
}

/* ─── Upcoming Match Card ─── */

function UpcomingMatchCard({ match, players, paidPlayers }: { match: NextMatch; players: Player[]; paidPlayers: Set<string> }) {
  const [roster, setRoster] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const p of players) {
      initial[p.id] = match.rosterPlayerIds.includes(p.id);
    }
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const selectedCount = Object.values(roster).filter(Boolean).length;
  const hasChanges = players.some((p) => roster[p.id] !== match.rosterPlayerIds.includes(p.id));

  async function handleSaveRoster() {
    setSaving(true);
    try {
      for (const player of players) {
        const currentlySelected = match.rosterPlayerIds.includes(player.id);
        if (roster[player.id] !== currentlySelected) {
          await toggleRosterPlayer(match.id, player.id);
        }
      }
      toast.success("Convocatoria guardada y publicada");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar convocatoria");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-surface-container-low border-l-2 border-primary border-t border-r border-b border-outline-variant rounded-lg p-md relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-surface-container-highest to-transparent opacity-50 pointer-events-none" />
      <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] text-surface-container-highest opacity-30 pointer-events-none">sports_volleyball</span>

      <div className="flex flex-col md:flex-row justify-between items-start gap-md relative z-10">
        {/* Match Info */}
        <div className="w-full md:w-1/2">
          <span className="inline-block bg-primary/20 text-primary border border-primary px-2 py-0.5 rounded font-sans text-label-bold text-[10px] uppercase tracking-widest mb-2">
            Próxima Jornada
          </span>
          <h3 className="font-display text-headline-md text-on-surface mb-xs">vs {match.opponent}</h3>
          <p className="font-sans text-body-md text-on-surface-variant flex items-center gap-xs mb-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            {formatMatchDate(match.date)}
          </p>
          <p className="font-sans text-body-md text-on-surface-variant flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {match.location}
          </p>
        </div>

        {/* Roster */}
        <div className="w-full md:w-1/2 bg-surface p-sm rounded border border-outline-variant">
          <div className="flex justify-between items-center mb-sm">
            <h4 className="font-sans text-label-bold text-on-surface">Convocatoria Rápida</h4>
            <span className="font-sans text-label-sm text-on-surface-variant">{selectedCount} / {players.length} selec.</span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto mb-sm pr-1">
            {players.map((player) => {
              const isPaid = paidPlayers.has(player.id);
              const checked = roster[player.id] ?? false;
              return (
                <label
                  key={player.id}
                  className={`flex items-center gap-sm p-1 hover:bg-surface-container-high rounded cursor-pointer transition-colors ${
                    !isPaid ? "opacity-50" : ""
                  }`}
                  title={!isPaid ? "Pendiente de pago - Avisar" : undefined}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setRoster((prev) => ({ ...prev, [player.id]: !prev[player.id] }))}
                    className="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-offset-surface"
                  />
                  <span className="font-sans text-body-md text-sm text-on-surface">
                    {player.name}
                    {!isPaid && (
                      <span className="text-error ml-1" title="Pendiente de pago">⚠️</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
          <button
            onClick={handleSaveRoster}
            disabled={!hasChanges || saving}
            className="w-full bg-surface-container-high text-primary border border-outline-variant font-sans text-label-bold py-1.5 rounded hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar y Publicar"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Announcement Form (inline, no redirect) ─── */

function AnnouncementFormInline({ teamId }: { teamId: string }) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      formData.set("targetTeamId", teamId);
      try {
        await createAnnouncement(formData);
        toast.success("Comunicado enviado al equipo");
        router.refresh();
        return { success: true };
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al enviar comunicado");
        return { success: false, error: e instanceof Error ? e.message : "Error" };
      }
    },
    { success: false },
  );

  return (
    <form action={formAction} className="space-y-sm">
      <input
        name="title"
        type="text"
        required
        placeholder="Asunto"
        className="w-full bg-surface border border-outline-variant rounded px-sm py-xs text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
      />
      <textarea
        name="content"
        required
        placeholder="Escribe el mensaje aquí..."
        rows={4}
        className="w-full bg-surface border border-outline-variant rounded px-sm py-xs text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
      />
      {state && typeof state === "object" && "error" in state && (state as { error: string }).error && (
        <div className="p-2 rounded bg-error-container/20 border border-error/30 text-error text-sm" role="alert">
          {(state as { error: string }).error}
        </div>
      )}
      <div className="flex justify-end pt-xs">
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="bg-transparent border-2 border-primary text-primary font-sans text-label-bold px-md py-xs rounded hover:bg-primary/10 transition-colors flex items-center gap-xs disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          {pending ? "..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
