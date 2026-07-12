"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

const labelMap: Record<string, string> = {
  dashboard: "Inicio",
  admin: "Panel Admin",
  coach: "Entrenador",
  teams: "Equipos",
  users: "Usuarios",
  matches: "Partidos",
  live: "En Vivo",
  profile: "Perfil",
  player: "Jugador",
  announcements: "Comunicados",
  roster: "Convocatoria",
  new: "Nuevo",
  calendario: "Calendario",
};

const validIndexRoutes = new Set([
  "/dashboard",
  "/dashboard/matches",
  "/dashboard/profile",
  "/dashboard/player",
  "/admin",
  "/admin/teams",
  "/admin/users",
  "/admin/announcements",
  "/coach",
  "/coach/matches",
  "/calendario",
  "/login",
  "/register",
]);

function segmentToLabel(segment: string): string {
  return labelMap[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const isClickable = validIndexRoutes.has(href);
    return { href, label: segmentToLabel(segment), isLast, isClickable };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
        <li>
          <Link href="/dashboard" className="hover:text-primary transition-colors" aria-label="Inicio">
            <span className="material-symbols-outlined text-[16px] align-middle">home</span>
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <Fragment key={crumb.href}>
            <li aria-hidden="true" className="text-outline-variant select-none">
              <span className="material-symbols-outlined text-[14px] align-middle">chevron_right</span>
            </li>
            <li>
              {crumb.isLast || !crumb.isClickable ? (
                <span className="text-on-surface font-medium" aria-current={crumb.isLast ? "page" : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
