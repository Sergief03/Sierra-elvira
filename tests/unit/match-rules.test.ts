import { describe, it, expect } from "vitest";

function isSetWon(ourPoints: number, oppPoints: number, setNumber: number): boolean {
  const target = setNumber === 5 ? 15 : 25;
  if (ourPoints >= target || oppPoints >= target) {
    return Math.abs(ourPoints - oppPoints) >= 2;
  }
  return false;
}

function isMatchWon(ourTotalSets: number, oppTotalSets: number): boolean {
  return ourTotalSets >= 3 || oppTotalSets >= 3;
}

describe("Volleyball Set Rules", () => {
  it("set is won at 25-23", () => {
    expect(isSetWon(25, 23, 1)).toBe(true);
  });

  it("set is NOT won at 24-23", () => {
    expect(isSetWon(24, 23, 1)).toBe(false);
  });

  it("set requires 2-point lead at deuce (26-24)", () => {
    expect(isSetWon(26, 24, 1)).toBe(true);
    expect(isSetWon(25, 24, 1)).toBe(false);
  });

  it("tie-break set (set 5) won at 15-13", () => {
    expect(isSetWon(15, 13, 5)).toBe(true);
  });

  it("tie-break requires 2-point lead (16-14)", () => {
    expect(isSetWon(15, 14, 5)).toBe(false);
    expect(isSetWon(16, 14, 5)).toBe(true);
  });

  it("match is won at 3 sets", () => {
    expect(isMatchWon(3, 1)).toBe(true);
    expect(isMatchWon(2, 3)).toBe(true);
  });

  it("match is not won before 3 sets", () => {
    expect(isMatchWon(2, 1)).toBe(false);
    expect(isMatchWon(1, 2)).toBe(false);
  });
});
