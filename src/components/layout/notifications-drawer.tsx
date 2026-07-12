"use client";

import { useEffect, useRef } from "react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface Props {
  open: boolean;
  onClose: () => void;
  announcements: Announcement[];
}

export function NotificationsDrawer({ open, onClose, announcements }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save and restore focus
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setTimeout(() => ref.current?.focus(), 50);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-50 transition-opacity duration-200",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-label="Notificaciones y comunicados"
        aria-modal="true"
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-surface-container-low border-l border-outline-variant z-50",
          "flex flex-col shadow-2xl transition-transform duration-300 ease-out focus:outline-none",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-md py-sm border-b border-outline-variant bg-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <h2 className="font-display text-headline-md text-on-surface">Notificaciones</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar notificaciones"
            className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Count badge */}
        <div className="px-md pt-sm pb-xs">
          <span className="font-sans text-label-sm text-on-surface-variant">
            {announcements.length === 0
              ? "Sin comunicados recientes"
              : `${announcements.length} comunicado${announcements.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-md py-sm space-y-3">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <span className="material-symbols-outlined text-5xl text-outline">notifications_off</span>
              <p className="font-sans text-body-md text-on-surface-variant">
                No hay comunicados por el momento
              </p>
            </div>
          ) : (
            announcements.map((a, i) => (
              <div
                key={a.id}
                className={cn(
                  "card-bg border card-border rounded-lg p-sm flex gap-3 group",
                  "hover:border-primary/30 transition-colors duration-200",
                  i === 0 && "border-l-2 border-l-primary"
                )}
              >
                <div className="mt-0.5 shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">campaign</span>
                </div>
                <div className="min-w-0">
                  <p className="font-sans font-bold text-label-bold text-on-surface leading-tight">
                    {a.title}
                  </p>
                  <p className="font-sans text-body-md text-on-surface-variant mt-1 text-sm leading-snug line-clamp-3">
                    {a.content}
                  </p>
                  <p className="font-sans text-label-sm text-outline mt-2">
                    {formatDate(a.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-md py-sm border-t border-outline-variant">
          <p className="font-sans text-label-sm text-on-surface-variant text-center">
            Los comunicados son publicados por el Club
          </p>
        </div>
      </div>
    </>
  );
}
