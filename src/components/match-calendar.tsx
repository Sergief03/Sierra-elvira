"use client";

interface Match {
  id: string;
  opponent: string;
  date: string;
  location: string;
  status: string;
}

interface Props {
  matches: Match[];
  year: number;
  month: number; // 0-indexed
  buildMatchLink?: (match: Match) => string;
  showLegend?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  LIVE: "bg-[#FF4B4B] text-white",
  COMPLETED: "bg-surface-container-highest text-on-surface-variant",
  SCHEDULED: "bg-primary/20 text-primary",
};

const STATUS_LABELS: Record<string, string> = {
  LIVE: "En Vivo",
  COMPLETED: "Finalizado",
  SCHEDULED: "Programado",
};

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function MatchCalendar({ matches, year, month, buildMatchLink, showLegend = true }: Props) {
  const firstDay = new Date(year, month, 1);
  // Monday-start offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Build a map: day number -> matches[]
  const matchesByDay = new Map<number, Match[]>();
  for (const m of matches) {
    const d = new Date(m.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      const cur = matchesByDay.get(day) ?? [];
      cur.push(m);
      matchesByDay.set(day, cur);
    }
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const monthName = firstDay.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <div className="card-bg border border-solid card-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-md py-sm border-b border-outline-variant flex items-center justify-between">
        <h3 className="font-display text-headline-md text-on-surface capitalize">{monthName}</h3>
        {showLegend && (
          <div className="flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-primary/50 inline-block" /> 
            <span className="font-sans text-label-sm text-on-surface-variant">Programado</span>
            <span className="w-2 h-2 rounded-full bg-[#FF4B4B] inline-block ml-sm" />
            <span className="font-sans text-label-sm text-on-surface-variant">En Vivo</span>
            <span className="w-2 h-2 rounded-full bg-surface-container-highest inline-block ml-sm" />
            <span className="font-sans text-label-sm text-on-surface-variant">Finalizado</span>
          </div>
        )}
      </div>

      <div className="p-sm">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center font-sans text-label-sm text-on-surface-variant py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-16 rounded" />;
            }

            const isToday =
              today.getDate() === day &&
              today.getMonth() === month &&
              today.getFullYear() === year;

            const dayMatches = matchesByDay.get(day) ?? [];
            const hasMatch = dayMatches.length > 0;

            return (
              <div
                key={day}
                className={`h-16 rounded-lg p-1 flex flex-col transition-colors ${
                  hasMatch
                    ? "bg-surface-container-high hover:bg-surface-container-highest cursor-pointer"
                    : "bg-surface-container"
                } ${isToday ? "ring-1 ring-primary" : ""}`}
              >
                <span
                  className={`font-sans text-[11px] font-bold leading-none mb-1 ${
                    isToday
                      ? "w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]"
                      : "text-on-surface-variant"
                  }`}
                >
                  {day}
                </span>
                <div className="flex flex-col gap-0.5 overflow-hidden">
                  {dayMatches.slice(0, 2).map((m) => (
                    <a
                      key={m.id}
                      href={buildMatchLink?.(m) ?? `/matches/${m.id}`}
                      className={`text-[9px] font-bold px-1 rounded truncate leading-tight ${
                        STATUS_COLORS[m.status] ?? "bg-surface-container-highest text-on-surface"
                      }`}
                      title={`${m.opponent} — ${STATUS_LABELS[m.status]}`}
                    >
                      vs {m.opponent}
                    </a>
                  ))}
                  {dayMatches.length > 2 && (
                    <span className="text-[9px] text-on-surface-variant font-bold pl-1">
                      +{dayMatches.length - 2} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
