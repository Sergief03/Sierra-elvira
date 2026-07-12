"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "@/actions/announcement.actions";
import { toast } from "sonner";

export function AnnouncementForm({ teamId }: { teamId: string | null }) {
  const router = useRouter();

  async function wrappedAction(_prev: unknown, formData: FormData) {
    if (teamId) formData.set("targetTeamId", teamId);
    try {
      await createAnnouncement(formData);
      toast.success("Comunicado enviado");
      router.refresh();
      return { success: true };
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al enviar comunicado");
      return { success: false, error: e instanceof Error ? e.message : "Error al enviar comunicado" };
    }
  }

  const [state, formAction, pending] = useActionState(wrappedAction, { success: false });

  return (
    <form action={formAction} className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex flex-col gap-4 max-w-[32rem]">
      <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary">campaign</span>
        <h3 className="font-display text-headline-md text-on-surface">Nuevo Comunicado</h3>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="atitle" className="font-sans text-label-bold text-on-surface">Título</label>
        <input id="atitle" name="title" type="text" required placeholder="Título del comunicado" className="input-field w-full text-body-md" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="acontent" className="font-sans text-label-bold text-on-surface">Mensaje</label>
        <textarea id="acontent" name="content" required rows={4} placeholder="Mensaje..." className="input-field w-full text-body-md resize-none" />
      </div>
      {state && typeof state === "object" && "error" in state && (state as { error: string }).error && (
        <div className="p-3 rounded-md bg-error-container/20 border border-error/30 text-error text-sm flex items-center gap-2" role="alert">
          <span className="material-symbols-outlined text-sm">error</span>
          {(state as { error: string }).error}
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-transparent border-2 border-primary text-primary font-sans text-label-bold px-md py-sm rounded-lg hover:bg-primary/10 transition-all flex items-center gap-xs"
          aria-busy={pending}
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          {pending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
