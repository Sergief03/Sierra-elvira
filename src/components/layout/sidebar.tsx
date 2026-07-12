"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import { getRoleLabel } from "@/lib/utils";
import { useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: "Inicio", href: "/dashboard", icon: "dashboard", roles: ["PLAYER", "COACH", "SUPER_ADMIN"] },
  { label: "Mi Perfil", href: "/dashboard/profile", icon: "account_circle", roles: ["PLAYER"] },
  { label: "Mis Partidos", href: "/dashboard/matches", icon: "sports_volleyball", roles: ["PLAYER"] },
  { label: "Partidos", href: "/coach/matches", icon: "sports_volleyball", roles: ["COACH", "SUPER_ADMIN"] },
  { label: "Equipos", href: "/coach", icon: "groups", roles: ["COACH", "SUPER_ADMIN"] },
  { label: "Panel Admin", href: "/admin", icon: "admin_panel_settings", roles: ["SUPER_ADMIN"] },
  { label: "Calendario Público", href: "/calendario", icon: "calendar_month", roles: ["PLAYER", "COACH", "SUPER_ADMIN"] },
  { label: "Usuarios", href: "/admin/users", icon: "people", roles: ["SUPER_ADMIN"] },
  { label: "Equipos", href: "/admin/teams", icon: "groups", roles: ["SUPER_ADMIN"] },
  { label: "Comunicados", href: "/admin/announcements", icon: "campaign", roles: ["SUPER_ADMIN"] },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const filteredItems = navItems.filter((item) => role && item.roles.includes(role));

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mobileOpen, onClose]);

  const sidebarContent = (
    <>
      <div className="px-md mb-lg flex items-center gap-sm">
        <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary font-display font-bold">
          {session?.user?.name?.charAt(0) ?? "S"}
        </div>
        <div>
          <h2 className="font-display text-headline-md text-primary leading-tight">Sierra Elvira</h2>
          <p className="font-sans text-label-sm text-on-surface-variant">Volleyball Club</p>
        </div>
      </div>

      <ul className="flex-1 px-sm space-y-xs" role="list">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-sm px-sm py-sm rounded-lg transition-colors duration-200",
                  isActive
                    ? "text-primary border-r-4 border-primary bg-secondary-container/10"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
                <span className="font-sans text-label-bold">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="px-sm mt-auto">
        <div className="border-t border-outline-variant pt-sm space-y-xs">
          <div className="flex items-center gap-sm px-sm py-sm rounded-lg text-on-surface-variant">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-sm font-bold text-on-secondary-container">
              {session?.user?.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-sans text-label-bold text-on-surface truncate">{session?.user?.name}</p>
              <p className="font-sans text-label-sm text-on-surface-variant truncate">{session?.user?.email}</p>
              {role && (
                <span className="font-sans text-label-sm text-primary-container">{getRoleLabel(role)}</span>
              )}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-sm px-sm py-sm w-full rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label="Cerrar sesión"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-sans text-label-bold">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden md:flex bg-surface-container-low border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex-col py-md z-50"
        aria-label="Navegación principal"
      >
        {sidebarContent}
      </nav>

      {/* Mobile sidebar overlay */}
      <nav
        className={cn(
          "md:hidden bg-surface-container-low border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex-col py-md z-50 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navegación principal"
        aria-hidden={!mobileOpen}
        style={!mobileOpen ? { visibility: "hidden", pointerEvents: "none" } : undefined}
      >
        {sidebarContent}
      </nav>
    </>
  );
}
