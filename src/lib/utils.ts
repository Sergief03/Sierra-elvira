import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export interface SetScore {
  ourPoints: number;
  oppPoints: number;
  setNumber: number;
}

export function formatSetScore(set: SetScore): string {
  return `${set.ourPoints}-${set.oppPoints}`;
}

export function formatMatchScore(
  ourTotalSets: number,
  oppTotalSets: number,
  sets: SetScore[]
): string {
  const setsStr = sets
    .sort((a, b) => a.setNumber - b.setNumber)
    .map(formatSetScore)
    .join(", ");
  return `${ourTotalSets} - ${oppTotalSets} | ${setsStr}`;
}

export function getCurrentMonthLabel(): string {
  const now = new Date();
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

export function getMonthStartEnd(monthLabel: string): { start: Date; end: Date } {
  const [monthName, yearStr] = monthLabel.split(" ");
  const year = parseInt(yearStr);
  const months: Record<string, number> = {
    Enero: 0, Febrero: 1, Marzo: 2, Abril: 3, Mayo: 4, Junio: 5,
    Julio: 6, Agosto: 7, Septiembre: 8, Octubre: 9, Noviembre: 10, Diciembre: 11,
  };
  const month = months[monthName];
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  return { start, end };
}

export function getLastSixMonths(): string[] {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const result: string[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) { m += 12; y -= 1; }
    result.push(`${months[m]} ${y}`);
  }
  return result;
}

const shortMonthMap: Record<string, string> = {
  Enero: "Ene", Febrero: "Feb", Marzo: "Mar", Abril: "Abr",
  Mayo: "May", Junio: "Jun", Julio: "Jul", Agosto: "Ago",
  Septiembre: "Sep", Octubre: "Oct", Noviembre: "Nov", Diciembre: "Dic",
};

export function getMonthShortLabel(monthLabel: string): string {
  const name = monthLabel.split(" ")[0];
  return shortMonthMap[name] ?? name.slice(0, 3);
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Administrador",
    COACH: "Entrenador",
    PLAYER: "Jugador",
  };
  return labels[role] ?? role;
}

export function getTeamRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    MAIN_COACH: "Entrenador Principal",
    SEC_COACH: "Entrenador Secundario",
    PLAYER: "Jugador",
  };
  return labels[role] ?? role;
}
