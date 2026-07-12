import { SessionProvider } from "@/components/layout/session-provider";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "COACH" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const announcements = await prisma.announcement.findMany({
    where: { targetTeamId: null },
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
