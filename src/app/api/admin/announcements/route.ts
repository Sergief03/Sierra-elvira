import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "COACH")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { title, content, targetTeamId } = await request.json();

  await prisma.announcement.create({
    data: { title, content, targetTeamId: targetTeamId || null },
  });

  return NextResponse.json({ success: true });
}
