import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpectatorView } from "@/app/dashboard/matches/[id]/spectator-view";

vi.mock("@/hooks/use-sse", () => ({
  useLiveMatch: () => null,
}));

const mockInitial = {
  id: "test-match-1",
  teamName: "Senior Masculino",
  opponent: "CV Almería",
  location: "Pabellón Municipal",
  status: "LIVE",
  currentSet: 2,
  ourTotalSets: 1,
  oppTotalSets: 0,
  sets: [
    { setNumber: 1, ourPoints: 25, oppPoints: 22 },
    { setNumber: 2, ourPoints: 7, oppPoints: 3 },
  ],
};

describe("SpectatorView", () => {
  it("renders team names", () => {
    render(<SpectatorView initial={mockInitial} matchId="test-match-1" />);
    expect(screen.getByText(/Senior Masculino/)).toBeInTheDocument();
    expect(screen.getByText(/CV Almería/)).toBeInTheDocument();
  });

  it("shows live indicator when match is LIVE", () => {
    render(<SpectatorView initial={mockInitial} matchId="test-match-1" />);
    expect(screen.getByText("En Directo")).toBeInTheDocument();
  });

  it("renders set scores", () => {
    render(<SpectatorView initial={mockInitial} matchId="test-match-1" />);
    expect(screen.getByText("Set 1")).toBeInTheDocument();
    expect(screen.getByText("Set 2")).toBeInTheDocument();
  });

  it("shows match finished for completed matches", () => {
    const completedState = { ...mockInitial, status: "COMPLETED" };
    render(<SpectatorView initial={completedState} matchId="test-match-1" />);
    expect(screen.getByText("Partido Finalizado")).toBeInTheDocument();
  });
});
