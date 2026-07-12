import { auth } from "@/auth";
import { type Role } from "@prisma/client";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthError("No autenticado");
  }
  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError(
      `Acceso denegado. Se requiere rol: ${allowedRoles.join(" o ")}`
    );
  }
  return session;
}
