"use client";

import { useState } from "react";
import { updateMatchAttendance } from "@/actions/roster.actions";
import { toast } from "sonner";

interface Props {
  matchId: string;
  initialStatus: string;
}

export function AttendanceButtons({ matchId, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: "CONFIRMED" | "DECLINED") => {
    setLoading(true);
    try {
      await updateMatchAttendance(matchId, newStatus);
      setStatus(newStatus);
      toast.success(
        newStatus === "CONFIRMED"
          ? "Asistencia confirmada con éxito"
          : "Asistencia declinada"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar la asistencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <button
        onClick={() => handleUpdate("CONFIRMED")}
        disabled={loading || status === "CONFIRMED"}
        className={`px-4 py-2 rounded-lg font-sans font-bold text-label-bold text-sm tracking-wide transition-all ${
          status === "CONFIRMED"
            ? "bg-[#2DFF8E] text-black scale-95 opacity-90 cursor-not-allowed"
            : "bg-[#2DFF8E]/20 text-[#2DFF8E] hover:bg-[#2DFF8E] hover:text-black hover:scale-95 duration-150"
        }`}
      >
        Confirmar Asistencia
      </button>
      <button
        onClick={() => handleUpdate("DECLINED")}
        disabled={loading || status === "DECLINED"}
        className={`px-4 py-2 rounded-lg font-sans font-bold text-label-bold text-sm tracking-wide transition-all ${
          status === "DECLINED"
            ? "bg-[#FF4B4B] text-white scale-95 opacity-90 cursor-not-allowed"
            : "bg-[#FF4B4B]/20 text-[#FF4B4B] hover:bg-[#FF4B4B] hover:text-white hover:scale-95 duration-150"
        }`}
      >
        Declinar
      </button>
    </div>
  );
}
