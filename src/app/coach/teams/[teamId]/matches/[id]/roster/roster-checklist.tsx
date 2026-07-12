"use client";

import { useOptimistic, useTransition, useCallback } from "react";
import { toggleRosterPlayer } from "@/actions/roster.actions";
import { toast } from "sonner";

interface PlayerItem {
  id: string;
  name: string;
  selected: boolean;
  attendanceStatus?: string;
}

export function RosterChecklist({
  matchId,
  players: initialPlayers,
}: {
  matchId: string;
  players: PlayerItem[];
}) {
  const [optimisticPlayers, addOptimistic] = useOptimistic(
    initialPlayers,
    (state, playerId: string) =>
      state.map((p) => (p.id === playerId ? { ...p, selected: !p.selected } : p))
  );
  const [, startTransition] = useTransition();

  const handleToggle = useCallback((playerId: string) => {
    const player = initialPlayers.find((p) => p.id === playerId);
    startTransition(async () => {
      addOptimistic(playerId);
      try {
        await toggleRosterPlayer(matchId, playerId);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al actualizar convocatoria");
      }
    });
  }, [matchId, initialPlayers, addOptimistic]);

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-headline-md text-on-surface">Convocatoria</h3>
        <span className="font-sans text-label-sm text-on-surface-variant">
          {optimisticPlayers.filter((p) => p.selected).length} / {optimisticPlayers.length} selec.
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {optimisticPlayers.map((player) => (
          <label
            key={player.id}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface-container-high cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={player.selected}
              onChange={() => handleToggle(player.id)}
              className="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary"
            />
            <span className={`font-sans text-body-md ${player.selected ? "text-on-surface font-label-bold" : "text-on-surface-variant"}`}>
              {player.name}
            </span>
            {player.selected && player.attendanceStatus && (
              <span className={`ml-auto inline-block px-2 py-0.5 rounded text-[11px] font-sans font-bold uppercase tracking-wider ${
                player.attendanceStatus === "CONFIRMED"
                  ? "bg-[#2DFF8E]/20 text-[#2DFF8E]"
                  : player.attendanceStatus === "DECLINED"
                  ? "bg-[#FF4B4B]/20 text-[#FF4B4B]"
                  : "bg-surface-container-highest text-on-surface-variant"
              }`}>
                {player.attendanceStatus === "CONFIRMED" ? "Confirmado" : player.attendanceStatus === "DECLINED" ? "Declinado" : "Pendiente"}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
