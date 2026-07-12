"use client";

import { useState, useMemo } from "react";
import { MultiMonthCalendar } from "@/components/multi-month-calendar";

interface TeamInfo {
  id: string;
  name: string;
  category: string;
}

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
}

interface Props {
  teams: TeamInfo[];
  matches: MatchInfo[];
}

export function PublicCalendarClient({ teams, matches }: Props) {
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const categories = useMemo(() => {
    const cats = new Set(teams.map((t) => t.category).filter(Boolean));
    return [...cats];
  }, [teams]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (selectedTeamIds.length > 0 && !selectedTeamIds.includes(m.teamId)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(m.teamCategory)) return false;
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      return true;
    });
  }, [matches, selectedTeamIds, selectedCategories, statusFilter]);

  function toggleTeam(teamId: string) {
    setSelectedTeamIds((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="material-symbols-outlined text-4xl text-primary">sports_volleyball</span>
            <h1 className="font-display text-display-lg text-primary">Calendario de Partidos</h1>
          </div>
          <p className="font-sans text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Consulta todos los partidos del Club Voleibol Sierra Elvira. Filtra por equipo, categoría o estado.
          </p>
        </div>

        {/* Filters */}
        <div className="card-bg border border-solid card-border rounded-xl p-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {/* Team filter */}
            <div>
              <label className="block font-sans text-label-bold text-on-surface mb-2">Equipo</label>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => toggleTeam(team.id)}
                    className={`px-3 py-1.5 rounded-lg font-sans text-label-sm transition-colors ${
                      selectedTeamIds.includes(team.id)
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
                {selectedTeamIds.length > 0 && (
                  <button
                    onClick={() => setSelectedTeamIds([])}
                    className="px-3 py-1.5 rounded-lg font-sans text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Category filter */}
            <div>
              <label className="block font-sans text-label-bold text-on-surface mb-2">Categoría</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-sans text-label-sm transition-colors ${
                      selectedCategories.includes(cat)
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="px-3 py-1.5 rounded-lg font-sans text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <label className="block font-sans text-label-bold text-on-surface mb-2">Estado</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "ALL", label: "Todos" },
                  { value: "SCHEDULED", label: "Programados" },
                  { value: "LIVE", label: "En Vivo" },
                  { value: "COMPLETED", label: "Finalizados" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatusFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-lg font-sans text-label-sm transition-colors ${
                      statusFilter === opt.value
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Count */}
          <p className="font-sans text-label-sm text-on-surface-variant mt-4">
            {filteredMatches.length} partido{filteredMatches.length !== 1 ? "s" : ""} encontrado{filteredMatches.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Live matches highlight */}
        {filteredMatches.some((m) => m.status === "LIVE") && (
          <div className="mb-8 card-border border border-solid rounded-xl p-md bg-danger/5 border-danger/30">
            <h3 className="font-display text-headline-md text-danger flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-danger animate-pulse" />
              En Directo
            </h3>
            <div className="space-y-2">
              {filteredMatches
                .filter((m) => m.status === "LIVE")
                .map((m) => (
                  <a
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="block bg-surface-container p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-label-bold text-on-surface">
                        {m.teamName} vs {m.opponent}
                      </span>
                      <span className="font-display text-headline-md text-primary">
                        {m.ourTotalSets} - {m.oppTotalSets}
                      </span>
                    </div>
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Calendar - all months */}
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
      </div>
    </div>
  );
}
