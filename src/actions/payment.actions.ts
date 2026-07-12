"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export async function recordPayment(_prev: unknown, formData: FormData) {
  try {
    await requireRole(["COACH", "SUPER_ADMIN"]);

    const playerId = formData.get("playerId") as string;
    const coachId = formData.get("coachId") as string;
    const month = formData.get("month") as string;
    const amountStr = formData.get("amount") as string;
    const amount = parseFloat(amountStr);

    if (!playerId || !coachId || !month || isNaN(amount)) {
      return { paid: false, error: "Datos inválidos" };
    }

    if (amount < 0 || amount > 99999) {
      return { paid: false, error: "Importe inválido" };
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findFirst({
        where: { playerId, month },
      });

      if (existing) {
        await tx.payment.update({
          where: { id: existing.id },
          data: { amount, coachId },
        });
      } else {
        await tx.payment.create({
          data: { playerId, coachId, month, amount },
        });
      }
    });

    revalidatePath("/coach/teams/[teamId]", "page");
    return { paid: true };
  } catch {
    return { paid: false, error: "Error al registrar pago" };
  }
}
