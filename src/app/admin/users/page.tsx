import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRoleLabel } from "@/lib/utils";
import { UserManagementClient } from "./user-management-client";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { memberships: true } },
    },
  });

  return (
    <div>
      <div>
        <h1 className="font-display text-display-xl text-on-surface">Usuarios del Club</h1>
        <p className="font-sans text-body-lg text-on-surface-variant mt-1">Gestión de jugadores, entrenadores y personal.</p>
      </div>
      <UserManagementClient users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        teamsCount: u._count.memberships,
        createdAt: u.createdAt.toISOString(),
      }))} />
    </div>
  );
}
