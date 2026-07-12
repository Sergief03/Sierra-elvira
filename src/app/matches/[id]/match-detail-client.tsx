"use client";

import { useState, useCallback, useEffect } from "react";
import { useLiveMatch } from "@/hooks/use-sse";
import {
  actionStartMatch,
  actionScorePoint,
  actionCloseSet,
  actionEndMatch,
} from "@/actions/match.actions";
import { toast } from "sonner";
import Link from "next/link";

interface SetScore {
  setNumber: number;
  ourPoints: number;
  oppPoints: number;
}

interface MatchDetailState {
  id: string;
  teamId: string;
  teamName: string;
  opponent: string;
  location: string;
  date: string;
  status: string;
  currentSet: number;
  ourTotalSets: number;
  oppTotalSets: number;
  sets: SetScore[];
}

interface Props {
  initial: MatchDetailState;
  matchId: string;
  isCoach: boolean;
}

function formatMatchDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const time = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" }).format(d);
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]} · ${time}h`;
}

function Countdown({ targetDate }: { targetDate: Date }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = targetDate.getTime() - Date.now();
      setRemaining(Math.max(0, diff));
    }, 200);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (remaining <= 0) return <span className="font-sans text-label-bold text-[#2DFF8E]">¡Comienza!</span>;

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  return (
    <div className="flex gap-3 items-center">
      {[
        { value: days, label: "Días" },
        { value: hours, label: "Horas" },
        { value: minutes, label: "Min" },
        { value: seconds, label: "Seg" },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <span className="block font-display text-headline-lg text-primary tabular-nums">{String(unit.value).padStart(2, "0")}</span>
          <span className="block font-sans text-label-sm text-on-surface-variant">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="bg-surface-container-low border border-outline-variant rounded-xl p-md max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h3 id="confirm-title" className="font-display text-headline-md text-on-surface mb-2">{title}</h3>
        <p className="font-sans text-body-md text-on-surface-variant mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="border border-outline text-on-surface-variant font-sans text-label-bold px-md py-sm rounded-lg hover:bg-surface-container-high transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-danger text-on-danger font-sans text-label-bold px-md py-sm rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
            aria-busy={loading}
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MatchDetailClient({ initial, matchId, isCoach }: Props) {
  const liveData = useLiveMatch(matchId);

  const state: MatchDetailState = {
    ...initial,
    ...(liveData
      ? {
          status: liveData.status,
          currentSet: liveData.currentSet,
          ourTotalSets: liveData.ourTotalSets,
          oppTotalSets: liveData.oppTotalSets,
          sets: liveData.sets,
        }
      : {}),
  };

  const [pending, setPending] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const isLive = state.status === "LIVE";
  const isScheduled = state.status === "SCHEDULED";
  const isCompleted = state.status === "COMPLETED";
  const currentSet = state.currentSet;
  const currentSetData = state.sets?.find((s) => s.setNumber === currentSet);
  const ourPoints = currentSetData?.ourPoints ?? 0;
  const oppPoints = currentSetData?.oppPoints ?? 0;
  const matchDate = new Date(state.date);

  const doAction = useCallback(async (action: string, label: string, fn: () => Promise<void>) => {
    setPending(action);
    try {
      await fn();
      toast.success(`${label} realizado`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Error al realizar ${label.toLowerCase()}`);
    } finally {
      setPending(null);
    }
  }, []);

  const handleStartMatch = useCallback(async () => {
    await doAction("start", "Partido iniciado", () => actionStartMatch(matchId));
  }, [matchId, doAction]);

  const handleEndMatch = useCallback(async () => {
    setPending("endMatch");
    try {
      await actionEndMatch(matchId);
      toast.success("Partido finalizado");
      setConfirmEnd(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al finalizar el partido");
    } finally {
      setPending(null);
    }
  }, [matchId]);

  const handleSetScore = useCallback(async (matchId: string, side: "our" | "opp", delta: 1 | -1, label: string) => {
    await doAction(`score_${side}_${delta > 0 ? "plus" : "minus"}`, label, () => actionScorePoint(matchId, side, delta));
  }, [doAction]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <div className="mb-4">
        <Link
          href="/calendario"
          className="inline-flex items-center gap-1 font-sans text-label-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver al calendario
        </Link>
      </div>

      {/* Match Header */}
      <div className="card-bg border border-solid card-border rounded-xl p-md mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isLive && (
                <span className="bg-danger px-2 py-1 rounded-sm text-on-danger font-sans text-label-bold text-xs uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-on-danger animate-pulse" />
                  EN DIRECTO
                </span>
              )}
              {isCompleted && (
                <span className="bg-surface-container-highest px-2 py-1 rounded-sm text-on-surface font-sans text-label-bold text-xs uppercase tracking-widest">
                  FINALIZADO
                </span>
              )}
              {isScheduled && (
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-sm font-sans text-label-bold text-xs uppercase tracking-widest">
                  PROGRAMADO
                </span>
              )}
            </div>
            <h1 className="font-display text-display-md text-on-surface">
              {state.teamName} vs {state.opponent}
            </h1>
            <div className="flex items-center gap-4 mt-2 font-sans text-body-md text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                {formatMatchDate(state.date)}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {state.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULED State */}
      {isScheduled && (
        <div className="card-bg border border-solid card-border rounded-xl p-md mb-6 text-center">
          <h2 className="font-display text-headline-md text-on-surface mb-4">Cuenta Atrás</h2>
          <div className="flex justify-center mb-6">
            <Countdown targetDate={matchDate} />
          </div>
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-3xl text-primary">shield</span>
              </div>
              <span className="font-sans font-bold text-label-bold text-on-surface">{state.teamName}</span>
            </div>
            <span className="font-display text-headline-lg text-on-surface-variant">VS</span>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-3xl text-tertiary">sports_volleyball</span>
              </div>
              <span className="font-sans font-bold text-label-bold text-on-surface">{state.opponent}</span>
            </div>
          </div>
          {isCoach && (
            <button
              onClick={handleStartMatch}
              disabled={pending !== null}
              className="bg-primary text-on-primary font-sans text-label-bold px-lg py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all self-center flex items-center gap-2 mx-auto"
              aria-busy={pending === "start"}
            >
              <span className="material-symbols-outlined">play_arrow</span>
              {pending === "start" ? "Iniciando..." : "Iniciar Partido"}
            </button>
          )}
        </div>
      )}

      {/* LIVE State */}
      {isLive && (
        <>
          {/* Confirmation dialog */}
          <ConfirmDialog
            open={confirmEnd}
            title="Finalizar Partido"
            message={`¿Estás seguro de que quieres finalizar el partido ${state.teamName} vs ${state.opponent}? Esta acción no se puede deshacer.`}
            confirmLabel="Sí, Finalizar"
            onConfirm={handleEndMatch}
            onCancel={() => setConfirmEnd(false)}
            loading={pending === "endMatch"}
          />

          {/* Scoreboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-6">
            {/* Local Team */}
            <div className="lg:col-span-5">
              <div className="card-glass rounded-xl p-md flex flex-col relative overflow-hidden border-l-4 border-l-primary">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">home</span>
                    </div>
                    <h3 className="font-display text-headline-md text-on-surface">{state.teamName}</h3>
                  </div>
                  <div className="bg-surface-container-high px-3 py-1 rounded-sm border border-outline-variant">
                    <span className="font-sans text-label-bold text-on-surface-variant text-sm">LOCAL</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-xl">
                  <div className="text-[120px] md:text-[160px] font-display text-primary leading-none tabular-nums tracking-tighter">
                    {ourPoints}
                  </div>
                  <div className="font-sans text-label-bold text-on-surface-variant mt-2 uppercase tracking-widest">Puntos</div>
                </div>
                {isCoach && (
                  <div className="grid grid-cols-2 gap-sm mt-auto">
                    <button
                      onClick={() => handleSetScore(matchId, "our", -1, "Deshacer punto")}
                      disabled={pending !== null}
                      className="bg-surface-container-high border border-outline-variant text-on-surface py-lg rounded-lg flex items-center justify-center hover:bg-surface-variant transition-all"
                      aria-label="Quitar punto"
                    >
                      <span className="material-symbols-outlined text-[32px]">remove</span>
                    </button>
                    <button
                      onClick={() => handleSetScore(matchId, "our", 1, "Punto anotado")}
                      disabled={pending !== null}
                      className="bg-primary text-on-primary py-lg rounded-lg flex items-center justify-center hover:bg-primary-container transition-all"
                      aria-label="Añadir punto"
                    >
                      <span className="material-symbols-outlined text-[40px]">add</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Sets */}
            <div className="lg:col-span-2 flex flex-col gap-sm">
              <div className="card-glass rounded-xl p-sm flex flex-col items-center justify-center h-48">
                <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Sets</span>
                <div className="flex items-center gap-4">
                  <span className="font-display text-headline-lg text-primary">{state.ourTotalSets}</span>
                  <span className="font-sans text-headline-md text-on-surface-variant">-</span>
                  <span className="font-display text-headline-lg text-on-surface">{state.oppTotalSets}</span>
                </div>
              </div>
              <div className="card-glass rounded-xl flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-outline-variant bg-surface-container-low text-center">
                  <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider">Historial Sets</span>
                </div>
                <div className="flex-1 p-3 flex flex-col gap-2">
                  {state.sets?.map((set) => {
                    const isCurrent = set.setNumber === currentSet;
                    return (
                      <div
                        key={set.setNumber}
                        className={`flex justify-between items-center p-2 rounded-sm border ${
                          isCurrent ? "bg-surface-container-high border-primary/30" : "bg-surface-container border-outline-variant"
                        }`}
                      >
                        <span className="font-sans text-label-bold text-on-surface text-sm">S{set.setNumber}</span>
                        <span className={`font-sans text-label-bold ${isCurrent ? "text-primary animate-pulse" : "text-primary"}`}>
                          {set.ourPoints} <span className="text-on-surface-variant mx-1">-</span> {set.oppPoints}
                        </span>
                      </div>
                    );
                  })}
                  {(!state.sets || state.sets.length === 0) && (
                    <p className="font-sans text-body-md text-on-surface-variant text-center py-4">Sin sets</p>
                  )}
                </div>
              </div>
            </div>

            {/* Visitor Team */}
            <div className="lg:col-span-5">
              <div className="card-glass rounded-xl p-md flex flex-col relative overflow-hidden">
                <div className="flex justify-between items-center mb-8 flex-row-reverse">
                  <div className="flex items-center gap-sm">
                    <h3 className="font-display text-headline-md text-on-surface">{state.opponent}</h3>
                    <div className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant">flight</span>
                    </div>
                  </div>
                  <div className="bg-surface-container-high px-3 py-1 rounded-sm border border-outline-variant">
                    <span className="font-sans text-label-bold text-on-surface-variant text-sm">VISITANTE</span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center py-xl">
                  <div className="text-[120px] md:text-[160px] font-display text-on-surface leading-none tabular-nums tracking-tighter">
                    {oppPoints}
                  </div>
                  <div className="font-sans text-label-bold text-on-surface-variant mt-2 uppercase tracking-widest">Puntos</div>
                </div>
                {isCoach && (
                  <div className="grid grid-cols-2 gap-sm mt-auto">
                    <button
                      onClick={() => handleSetScore(matchId, "opp", -1, "Deshacer punto visitante")}
                      disabled={pending !== null}
                      className="bg-surface-container border border-outline-variant text-on-surface py-lg rounded-lg flex items-center justify-center hover:bg-surface-variant transition-all"
                      aria-label="Quitar punto visitante"
                    >
                      <span className="material-symbols-outlined text-[32px]">remove</span>
                    </button>
                    <button
                      onClick={() => handleSetScore(matchId, "opp", 1, "Punto visitante")}
                      disabled={pending !== null}
                      className="bg-surface-container-high border border-outline-variant text-on-surface py-lg rounded-lg flex items-center justify-center hover:bg-surface-bright transition-all"
                      aria-label="Añadir punto visitante"
                    >
                      <span className="material-symbols-outlined text-[40px]">add</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coach Actions */}
          {isCoach && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-sm mb-6">
              <button
                onClick={() => doAction("closeSet", "Set cerrado", () => actionCloseSet(matchId))}
                disabled={pending !== null}
                className="card-glass p-sm rounded-lg flex items-center justify-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Cerrar set actual"
              >
                <span className="material-symbols-outlined text-sm">flag</span>
                <span className="font-sans text-label-sm">Cerrar Set</span>
              </button>
              <div className="relative group">
                <button className="card-glass p-sm rounded-lg flex items-center justify-center gap-2 text-on-surface-variant/50 cursor-not-allowed w-full" disabled>
                  <span className="material-symbols-outlined text-sm">timer</span>
                  <span className="font-sans text-label-sm">Tiempo Muerto</span>
                </button>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 translate-y-[-100%] hidden group-hover:block bg-surface-container-high text-on-surface text-label-sm px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  Próximamente
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface-container-high" />
                </div>
              </div>
              <div className="relative group">
                <button className="card-glass p-sm rounded-lg flex items-center justify-center gap-2 text-on-surface-variant/50 cursor-not-allowed w-full" disabled>
                  <span className="material-symbols-outlined text-sm">sync_alt</span>
                  <span className="font-sans text-label-sm">Sustitución</span>
                </button>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 translate-y-[-100%] hidden group-hover:block bg-surface-container-high text-on-surface text-label-sm px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  Próximamente
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-surface-container-high" />
                </div>
              </div>
              <button
                onClick={() => setConfirmEnd(true)}
                disabled={pending !== null}
                className="card-glass p-sm rounded-lg flex items-center justify-center gap-2 text-on-surface-variant hover:text-danger transition-colors"
                aria-label="Finalizar partido"
              >
                <span className="material-symbols-outlined text-sm">stop_circle</span>
                <span className="font-sans text-label-sm">Finalizar</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* COMPLETED State */}
      {isCompleted && (
        <div className="card-bg border border-solid card-border rounded-xl p-md mb-6 text-center">
          <h2 className="font-display text-headline-md text-on-surface mb-2">Partido Finalizado</h2>
          <div className="font-display text-display-lg text-primary mt-4 mb-8">
            {state.teamName} {state.ourTotalSets} - {state.oppTotalSets} {state.opponent}
          </div>

          {/* Set breakdown */}
          {state.sets && state.sets.length > 0 && (
            <div className="max-w-md mx-auto">
              <h3 className="font-sans text-label-bold text-on-surface-variant uppercase tracking-wider mb-4">Desglose por Sets</h3>
              <div className="space-y-2">
                {state.sets.map((set) => {
                  const wonSet = set.ourPoints > set.oppPoints;
                  return (
                    <div
                      key={set.setNumber}
                      className={`flex justify-between items-center p-3 rounded-lg ${
                        wonSet ? "bg-[#2DFF8E]/10 border border-[#2DFF8E]/30" : "bg-surface-container border border-outline-variant"
                      }`}
                    >
                      <span className="font-sans text-label-bold text-on-surface">Set {set.setNumber}</span>
                      <div className="flex items-center gap-3">
                        <span className={`font-display text-headline-md ${wonSet ? "text-[#2DFF8E]" : "text-on-surface"}`}>
                          {set.ourPoints}
                        </span>
                        <span className="font-sans text-headline-md text-on-surface-variant">-</span>
                        <span className={`font-display text-headline-md ${!wonSet ? "text-[#FF4B4B]" : "text-on-surface"}`}>
                          {set.oppPoints}
                        </span>
                        {wonSet && (
                          <span className="material-symbols-outlined text-[#2DFF8E]">check_circle</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
