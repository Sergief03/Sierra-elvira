"use client";

import { useActionState } from "react";
import { createMatch } from "@/actions/match.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CreateMatchForm({ teamId }: { teamId: string }) {
  const router = useRouter();

  async function wrappedAction(_prev: unknown, formData: FormData) {
    formData.set("teamId", teamId);
    try {
      await createMatch(formData);
      toast.success("Partido creado con éxito");
      router.push(`/coach/teams/${teamId}`);
      return { success: true };
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear partido");
      return { success: false, error: e instanceof Error ? e.message : "Error al crear partido" };
    }
  }

  const [state, formAction, pending] = useActionState(wrappedAction, { success: false });

  return (
    <form action={formAction} className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-col gap-4 max-w-[28rem]">
      <h3 className="font-display text-headline-md text-on-surface">Nuevo Partido</h3>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="opponent" className="font-sans text-label-bold text-on-surface">Equipo Rival</label>
        <input id="opponent" name="opponent" type="text" required placeholder="Ej: CV Granada" className="input-field w-full text-body-md" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className="font-sans text-label-bold text-on-surface">Fecha</label>
        <input id="date" name="date" type="date" required className="input-field w-full text-body-md" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="time" className="font-sans text-label-bold text-on-surface">Hora</label>
        <input id="time" name="time" type="time" required className="input-field w-full text-body-md" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="location" className="font-sans text-label-bold text-on-surface">Lugar</label>
        <input id="location" name="location" type="text" required placeholder="Pabellón Municipal" className="input-field w-full text-body-md" />
      </div>
      {state && typeof state === "object" && "error" in state && (state as { error: string }).error && (
        <div className="p-3 rounded-md bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-2" role="alert">
          <span className="material-symbols-outlined text-sm">error</span>
          {(state as { error: string }).error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start bg-primary text-on-primary font-sans text-label-bold px-lg py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-[0.98] disabled:opacity-50"
        aria-busy={pending}
      >
        {pending ? "Creando..." : "Crear Partido"}
      </button>
    </form>
  );
}
