import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function PaymentChip({ paid }: { paid: boolean }) {
  if (paid) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/20 text-success font-label-bold text-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        Pagado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-danger/20 text-danger font-label-bold text-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-danger" />
      Pendiente
    </span>
  );
}

describe("PaymentChip", () => {
  it("renders 'Pagado' when paid is true", () => {
    render(<PaymentChip paid={true} />);
    expect(screen.getByText("Pagado")).toBeInTheDocument();
  });

  it("renders 'Pendiente' when paid is false", () => {
    render(<PaymentChip paid={false} />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });
});
