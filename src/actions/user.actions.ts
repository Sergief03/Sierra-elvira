"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { Role } from "@prisma/client";

const VALID_ROLES: Role[] = ["PLAYER", "COACH", "SUPER_ADMIN"];

export async function createUser(formData: FormData) {
  await requireRole(["SUPER_ADMIN"]);

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const roleInput = formData.get("role") as string;

  if (!name || !email || !password || !roleInput) {
    throw new Error("Todos los campos son obligatorios");
  }

  if (!email.includes("@") || !email.includes(".")) {
    throw new Error("Email inválido");
  }

  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }

  if (!VALID_ROLES.includes(roleInput as Role)) {
    throw new Error("Rol inválido");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name, email, password: hashedPassword, role: roleInput as Role },
  });

  revalidatePath("/admin/users");
}

export async function updateUser(userId: string, formData: FormData) {
  await requireRole(["SUPER_ADMIN"]);

  const name = (formData.get("name") as string)?.trim();
  const roleInput = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!name || !roleInput) {
    throw new Error("Nombre y rol son obligatorios");
  }

  if (!VALID_ROLES.includes(roleInput as Role)) {
    throw new Error("Rol inválido");
  }

  const data: Record<string, unknown> = { name, role: roleInput as Role };
  if (password && password.length >= 6) {
    data.password = await bcrypt.hash(password, 12);
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await requireRole(["SUPER_ADMIN"]);

  const session = await (await import("@/auth")).auth();
  if (session?.user?.id === userId) {
    throw new Error("No puedes eliminarte a ti mismo");
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
}
