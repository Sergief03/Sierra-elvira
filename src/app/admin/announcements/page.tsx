import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import { AnnouncementForm } from "./announcement-form";

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-xl text-on-surface">Comunicados Globales</h1>
        <p className="font-sans text-body-lg text-on-surface-variant mt-1">Anuncios para todos los equipos del club.</p>
      </div>

      <AnnouncementForm teamId={null} />

      <div className="flex flex-col gap-3">
        {announcements.length === 0 ? (
          <p className="font-sans text-body-md text-on-surface-variant">No hay comunicados.</p>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className="bg-surface-container-low border border-outline-variant rounded-lg p-md flex items-start gap-3"
            >
              <span className="material-symbols-outlined text-primary mt-1">campaign</span>
              <div>
                <h3 className="font-display text-headline-md text-on-surface">{a.title}</h3>
                <p className="font-sans text-body-md text-on-surface-variant mt-1">{a.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-sans text-label-sm text-on-surface-variant">Admin</span>
                  <span className="font-sans text-label-sm text-on-surface-variant">{formatDate(a.createdAt)}</span>
                  {a.targetTeamId && <span className="chip-secondary px-2 py-0.5 rounded font-sans text-label-sm">Específico</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
