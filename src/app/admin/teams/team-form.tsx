"use client";

import { useActionState } from "react";
import { createTeam } from "@/actions/team.actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TeamForm() {
  const router = useRouter();

  async function wrappedAction(_prev: unknown, formData: FormData) {
    try {
      await createTeam(formData);
      toast.success("Equipo creado con éxito");
      router.refresh();
      return { success: true };
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear equipo");
      return { success: false, error: e instanceof Error ? e.message : "Error al crear equipo" };
    }
  }

  const [state, formAction, pending] = useActionState(wrappedAction, { success: false });

  return (
    <form action={formAction} className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="teamName" className="font-sans text-label-bold text-on-surface text-sm">Nombre</label>
        <input id="teamName" name="name" type="text" required placeholder="Nuevo equipo" className="input-field text-body-md" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="teamCategory" className="font-sans text-label-bold text-on-surface text-sm">Categoría</label>
        <input id="teamCategory" name="category" type="text" required placeholder="Ej: Senior" className="input-field text-body-md" />
      </div>
      {state && typeof state === "object" && "error" in state && (state as { error: string }).error && (
        <div className="w-full p-2 rounded-md bg-error-container/20 border border-error/30 text-error text-sm" role="alert">{(state as { error: string }).error}</div>
      )}
      <button type="submit" disabled={pending} className="bg-primary text-on-primary font-sans text-label-bold px-md py-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50" aria-busy={pending}>
        {pending ? "..." : "Crear Equipo"}
      </button>
    </form>
  );
}
