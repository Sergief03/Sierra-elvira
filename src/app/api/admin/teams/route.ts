import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;

  await prisma.team.create({ data: { name, category } });

  return NextResponse.redirect(new URL("/admin/teams", request.url));
}
