import { SessionProvider } from "@/components/layout/session-provider";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const teamId = await prisma.teamMember
    .findFirst({ where: { userId: session.user.id }, select: { teamId: true } })
    .then((m) => m?.teamId ?? null);

  const announcements = await prisma.announcement.findMany({
    where: { OR: [{ targetTeamId: null }, ...(teamId ? [{ targetTeamId: teamId }] : [])] },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <SessionProvider>
      <AppShell announcements={announcements}>
        {children}
      </AppShell>
    </SessionProvider>
  );
}
