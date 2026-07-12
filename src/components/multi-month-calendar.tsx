"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { MatchCalendar } from "./match-calendar";

interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string;
  status: string;
}

interface Props {
  matches: Match[];
  buildMatchLink?: (match: Match) => string;
}

const INITIAL_LOAD = 12;

export function MultiMonthCalendar({ matches, buildMatchLink }: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    const startYear = 2026;
    const endYear = new Date().getFullYear() + 5;

    for (let y = startYear; y <= endYear; y++) {
      for (let m = 0; m <= 11; m++) {
        result.push({ year: y, month: m });
      }
    }
    return result;
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 12, months.length));
  }, [months.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < months.length) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, months.length, loadMore]);

  const visibleMonths = months.slice(0, visibleCount);

  return (
    <>
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="w-2 h-2 rounded-full bg-primary/50 inline-block" />
        <span className="font-sans text-label-sm text-on-surface-variant">Programado</span>
        <span className="w-2 h-2 rounded-full bg-[#FF4B4B] inline-block ml-2" />
        <span className="font-sans text-label-sm text-on-surface-variant">En Vivo</span>
        <span className="w-2 h-2 rounded-full bg-surface-container-highest inline-block ml-2" />
        <span className="font-sans text-label-sm text-on-surface-variant">Finalizado</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleMonths.map(({ year, month }) => {
          const hasMatches = matches.some((m) => {
            const d = new Date(m.date);
            return d.getFullYear() === year && d.getMonth() === month;
          });

          return (
            <div key={`${year}-${month}`} className={hasMatches ? "" : "opacity-50"}>
              <MatchCalendar
                matches={matches}
                year={year}
                month={month}
                buildMatchLink={buildMatchLink}
                showLegend={false}
              />
            </div>
          );
        })}
      </div>
      {visibleCount < months.length && (
        <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
          <span className="font-sans text-label-sm text-on-surface-variant animate-pulse">Cargando más meses...</span>
        </div>
      )}
    </>
  );
}
