import { SessionProvider } from "@/components/layout/session-provider";
import { AppShell } from "@/components/layout/app-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const announcements = await prisma.announcement.findMany({
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
