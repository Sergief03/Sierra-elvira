import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function sanitizeCsvValue(value: string): string {
  const sanitized = value.replace(/^[=\+\-@]/, "");
  return `"${sanitized.replace(/"/g, '""')}"`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\p{L}]/gu, "_");
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? undefined;

  const payments = await prisma.payment.findMany({
    where: month ? { month } : undefined,
    include: {
      player: { select: { name: true, email: true } },
      coach: { select: { name: true } },
    },
    orderBy: { paidAt: "desc" },
  });

  const header = ["Jugador", "Email", "Entrenador", "Mes", "Importe (€)", "Fecha Pago"];
  const rows = payments.map((p) => [
    sanitizeCsvValue(p.player.name),
    sanitizeCsvValue(p.player.email),
    sanitizeCsvValue(p.coach.name),
    sanitizeCsvValue(p.month),
    p.amount.toFixed(2),
    sanitizeCsvValue(p.paidAt.toLocaleDateString("es-ES")),
  ]);

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const filename = month
    ? `pagos_${sanitizeFilename(month)}.csv`
    : "pagos_completo.csv";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
