import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatSetScore,
  formatMatchScore,
  getCurrentMonthLabel,
  getRoleLabel,
  getTeamRoleLabel,
} from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "visible");
    expect(result).toBe("base visible");
  });

  it("handles tailwind conflicts", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });
});

describe("formatCurrency", () => {
  it("formats EUR currency", () => {
    expect(formatCurrency(30)).toContain("30");
    expect(formatCurrency(30)).toContain("€");
  });

  it("formats decimal amounts", () => {
    expect(formatCurrency(25.5)).toContain("25");
  });
});

describe("formatSetScore", () => {
  it("formats set scores", () => {
    expect(formatSetScore({ setNumber: 1, ourPoints: 25, oppPoints: 18 })).toBe("25-18");
  });

  it("handles tie-break", () => {
    expect(formatSetScore({ setNumber: 5, ourPoints: 15, oppPoints: 13 })).toBe("15-13");
  });
});

describe("formatMatchScore", () => {
  it("formats full match score with sets", () => {
    const sets = [
      { setNumber: 1, ourPoints: 25, oppPoints: 18 },
      { setNumber: 2, ourPoints: 22, oppPoints: 25 },
      { setNumber: 3, ourPoints: 25, oppPoints: 20 },
      { setNumber: 4, ourPoints: 25, oppPoints: 15 },
    ];
    expect(formatMatchScore(3, 1, sets)).toBe("3 - 1 | 25-18, 22-25, 25-20, 25-15");
  });
});

describe("getCurrentMonthLabel", () => {
  it("returns current month in Spanish format", () => {
    const label = getCurrentMonthLabel();
    expect(label).toMatch(/[A-Za-z]+ \d{4}/);
  });
});

describe("getRoleLabel", () => {
  it("returns Spanish labels", () => {
    expect(getRoleLabel("SUPER_ADMIN")).toBe("Administrador");
    expect(getRoleLabel("COACH")).toBe("Entrenador");
    expect(getRoleLabel("PLAYER")).toBe("Jugador");
  });
});

describe("getTeamRoleLabel", () => {
  it("returns Spanish team role labels", () => {
    expect(getTeamRoleLabel("MAIN_COACH")).toBe("Entrenador Principal");
    expect(getTeamRoleLabel("SEC_COACH")).toBe("Entrenador Secundario");
    expect(getTeamRoleLabel("PLAYER")).toBe("Jugador");
  });
});
