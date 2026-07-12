import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AnnouncementForm } from "./announcement-form";

export const dynamic = 'force-dynamic';

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  const session = await auth();
  if (!session?.user) return null;

  const membership = await prisma.teamMember.findFirst({
    where: { userId: session.user.id, teamId, roleInTeam: { in: ["MAIN_COACH", "SEC_COACH"] } },
  });
  if (!membership && session.user.role !== "SUPER_ADMIN") notFound();

  return (
    <div className="max-w-[32rem]">
      <h2 className="font-display text-headline-md text-primary mb-4">Enviar Comunicado al Equipo</h2>
      <AnnouncementForm teamId={teamId} />
    </div>
  );
}
