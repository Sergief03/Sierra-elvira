import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTeamRoleLabel } from "@/lib/utils";
import { redirect } from "next/navigation";
import { TeamMemberAssignment } from "./team-member-assignment";
import { TeamForm } from "./team-form";

export const dynamic = 'force-dynamic';

export default async function AdminTeamsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: { user: true },
        orderBy: { roleInTeam: "asc" },
      },
      _count: { select: { matches: true } },
    },
  });

  const allUsers = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-display-xl text-on-surface">Equipos del Club</h1>
        <p className="font-sans text-body-lg text-on-surface-variant mt-1">Gestión de equipos, miembros y roles.</p>
      </div>

      <TeamForm />

      <div className="grid gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-surface-container-low border border-outline-variant rounded-lg p-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-headline-md text-on-surface">{team.name}</h3>
                <p className="font-sans text-body-md text-on-surface-variant">{team.category}</p>
              </div>
              <span className="font-sans text-label-sm text-on-surface-variant">{team._count.matches} partidos</span>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <p className="font-sans text-label-bold text-on-surface-variant uppercase tracking-wider text-sm">Miembros</p>
              {team.members.length === 0 ? (
                <p className="font-sans text-body-md text-on-surface-variant">Sin miembros asignados.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {team.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-container border border-outline-variant">
                      <span className="font-sans text-label-bold text-on-surface text-sm">{m.user.name}</span>
                      <span className="font-sans text-label-sm text-primary-container">{getTeamRoleLabel(m.roleInTeam)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <TeamMemberAssignment teamId={team.id} allUsers={allUsers} />
          </div>
        ))}
      </div>
    </div>
  );
}
