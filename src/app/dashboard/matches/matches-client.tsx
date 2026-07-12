"use client";

import { useState, useMemo } from "react";
import { MultiMonthCalendar } from "@/components/multi-month-calendar";
import Link from "next/link";

interface SetScore {
  setNumber: number;
  ourPoints: number;
  oppPoints: number;
}

interface MatchInfo {
  id: string;
  teamId: string;
  teamName: string;
  teamCategory: string;
  opponent: string;
  date: string;
  location: string;
  status: string;
  ourTotalSets: number;
  oppTotalSets: number;
  sets: SetScore[];
  rosterStatus?: string | null;
}

interface Props {
  teams: { id: string; name: string; category: string }[];
  matches: MatchInfo[];
  role: "PLAYER" | "COACH";
}

function formatListItemDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} · ${time}h`;
}

type ViewMode = "calendar" | "list";

export function MatchesClient({ teams, matches, role }: Props) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusTab, setStatusTab] = useState<string>("ALL");

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (selectedTeamId !== "ALL" && m.teamId !== selectedTeamId) return false;
      if (statusTab === "UPCOMING" && m.status !== "SCHEDULED") return false;
      if (statusTab === "LIVE" && m.status !== "LIVE") return false;
      if (statusTab === "COMPLETED" && m.status !== "COMPLETED") return false;
      return true;
    });
  }, [matches, selectedTeamId, statusTab]);

  const tabs = [
    { value: "ALL", label: "Todos" },
    { value: "UPCOMING", label: "Próximos" },
    { value: "COMPLETED", label: "Finalizados" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-xl text-on-surface">Partidos</h1>
        <p className="font-sans text-body-lg text-on-surface-variant mt-1">
          {role === "PLAYER" ? "Todos tus partidos en un solo lugar." : "Gestión de partidos de tus equipos."}
        </p>
      </div>

      {/* Team selector */}
      {teams.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTeamId("ALL")}
            className={`px-3 py-1.5 rounded-lg font-sans text-label-sm transition-colors ${
              selectedTeamId === "ALL"
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
            }`}
          >
            Todos los equipos
          </button>
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`px-3 py-1.5 rounded-lg font-sans text-label-sm transition-colors ${
                selectedTeamId === team.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      )}

      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg font-sans text-label-sm transition-colors ${
                statusTab === tab.value
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-surface-container rounded-lg p-1 border border-outline-variant">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded font-sans text-label-sm transition-colors flex items-center gap-1 ${
              viewMode === "list"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            aria-label="Vista lista"
          >
            <span className="material-symbols-outlined text-sm">list</span>
            Lista
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1.5 rounded font-sans text-label-sm transition-colors flex items-center gap-1 ${
              viewMode === "calendar"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            aria-label="Vista calendario"
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            Calendario
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <MultiMonthCalendar
          matches={filteredMatches.map((m) => ({
            id: m.id,
            opponent: m.opponent,
            date: m.date,
            location: m.location,
            status: m.status,
          }))}
          buildMatchLink={(m) => `/matches/${m.id}`}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl text-outline">sports_volleyball</span>
              <p className="font-sans text-body-md">No hay partidos que mostrar</p>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const won = m.ourTotalSets > m.oppTotalSets;
              const isScheduled = m.status === "SCHEDULED";
              const isLive = m.status === "LIVE";
              const isCompleted = m.status === "COMPLETED";

              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className={`block card-bg border border-solid card-border rounded-xl p-4 hover:bg-surface-container-high transition-colors ${
                    isLive ? "border-l-4 border-l-danger" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isLive && (
                          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                        )}
                        <span className="font-sans text-label-sm text-on-surface-variant">
                          {formatListItemDate(m.date)}
                        </span>
                        {m.teamCategory && (
                          <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
                            {m.teamCategory}
                          </span>
                        )}
                      </div>
                      <p className="font-sans font-bold text-label-bold text-on-surface truncate">
                        {m.teamName} vs {m.opponent}
                      </p>
                      <p className="font-sans text-label-sm text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {m.location}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      {isLive && (
                        <span className="bg-danger text-on-danger px-2 py-1 rounded-sm font-sans text-label-bold text-xs uppercase tracking-widest">
                          EN VIVO
                        </span>
                      )}
                      {isScheduled && (
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span className="font-sans text-label-sm">
                            {new Date(m.date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}h
                          </span>
                        </div>
                      )}
                      {isCompleted && (
                        <div>
                          <span className={`block font-display font-semibold text-headline-md ${won ? "text-[#2DFF8E]" : "text-[#FF4B4B]"}`}>
                            {m.ourTotalSets} - {m.oppTotalSets}
                          </span>
                          <span className="font-sans text-label-sm text-on-surface-variant uppercase">
                            {won ? "Victoria" : "Derrota"}
                          </span>
                        </div>
                      )}
                      {m.rosterStatus && isScheduled && (
                        <span className={`block mt-1 text-[10px] uppercase tracking-wider font-bold ${
                          m.rosterStatus === "CONFIRMED" ? "text-[#2DFF8E]" : m.rosterStatus === "DECLINED" ? "text-[#FF4B4B]" : "text-on-surface-variant"
                        }`}>
                          {m.rosterStatus === "CONFIRMED" ? "✓ Confirmado" : m.rosterStatus === "DECLINED" ? "✕ Declinado" : "? Pendiente"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Count */}
      <p className="font-sans text-label-sm text-on-surface-variant text-center">
        {filteredMatches.length} partido{filteredMatches.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
