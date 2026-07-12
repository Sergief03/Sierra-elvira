"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { NotificationsDrawer } from "@/components/layout/notifications-drawer";

interface BottomNavItem {
  icon: string;
  label: string;
  href: string;
  roles: string[];
}

const bottomNavItems: BottomNavItem[] = [
  { icon: "dashboard", label: "Inicio", href: "/dashboard", roles: ["PLAYER", "COACH", "SUPER_ADMIN"] },
  { icon: "admin_panel_settings", label: "Panel Admin", href: "/admin", roles: ["SUPER_ADMIN"] },
  { icon: "groups", label: "Equipos", href: "/coach", roles: ["COACH", "SUPER_ADMIN"] },
  { icon: "sports_volleyball", label: "Mis Partidos", href: "/dashboard/matches", roles: ["PLAYER"] },
  { icon: "sports_volleyball", label: "Partidos", href: "/coach/matches", roles: ["COACH", "SUPER_ADMIN"] },
  { icon: "calendar_month", label: "Calendario", href: "/calendario", roles: ["PLAYER", "COACH", "SUPER_ADMIN"] },
  { icon: "account_circle", label: "Perfil", href: "/dashboard/profile", roles: ["PLAYER"] },
];

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export function AppShell({ children, announcements = [] }: { children: React.ReactNode; announcements?: Announcement[] }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const role = session?.user?.role;

  const filteredBottomNav = bottomNavItems.filter((item) => role && item.roles.includes(role));

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <header className="bg-surface border-b border-outline-variant fixed top-0 right-0 left-0 md:left-64 h-16 flex items-center justify-between px-margin-mobile md:px-margin-desktop z-40">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú de navegación"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="md:hidden flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">sports_volleyball</span>
              <span className="font-display text-headline-md text-primary">SE</span>
            </div>
            <h2 className="hidden md:block font-display text-headline-md font-black text-on-surface tracking-tight">
              Club Voleibol Sierra Elvira
            </h2>
          </div>
          <div className="flex items-center gap-md">
            {/* Notification bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="text-on-surface-variant hover:text-primary transition-colors relative"
              aria-label={`Notificaciones${announcements.length > 0 ? ` (${announcements.length} comunicados)` : ""}`}
            >
              <span className="material-symbols-outlined">notifications</span>
              {announcements.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#FF4B4B] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                  aria-hidden="true"
                >
                  {announcements.length > 9 ? "9+" : announcements.length}
                </span>
              )}
            </button>
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-sm font-bold text-on-secondary-container border border-outline-variant"
              aria-hidden="true"
            >
              {session?.user?.name?.charAt(0) ?? "?"}
            </div>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main
          id="main-content"
          className="flex-1 pt-24 pb-24 md:pb-lg px-margin-mobile md:px-margin-desktop overflow-y-auto"
          role="main"
          aria-label="Contenido principal"
        >
          <Breadcrumbs />
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-4 py-2 flex justify-between items-center"
        aria-label="Navegación inferior"
      >
        {filteredBottomNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center p-2 transition-colors",
                isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <span className="text-[10px] font-sans text-label-bold mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        announcements={announcements}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e2020",
            color: "#e3e2e2",
            border: "1px solid #584237",
          },
        }}
      />
    </div>
  );
}
