"use client";

import { useActionState, useState } from "react";
import { recordPayment } from "@/actions/payment.actions";
import { toast } from "sonner";

export function RecordPaymentForm({
  playerId,
  coachId,
  month,
}: {
  playerId: string;
  coachId: string;
  month: string;
}) {
  const [amount, setAmount] = useState("30");
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      formData.set("playerId", playerId);
      formData.set("coachId", coachId);
      formData.set("month", month);
      try {
        const result = await recordPayment(_prev, formData);
        if (result && typeof result === "object" && "error" in result && (result as { error: string }).error) {
          toast.error((result as { error: string }).error);
          return result;
        }
        toast.success("Pago registrado");
        return result;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Error al registrar pago");
        return { paid: false, error: e instanceof Error ? e.message : "Error" };
      }
    },
    { paid: false }
  );

  const result = state && typeof state === "object"
    ? (state as { paid: boolean; error?: string })
    : { paid: false };
  const paid = result.paid;

  if (paid) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/20 text-success font-sans text-label-bold text-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        Pagado
      </span>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2 justify-center">
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="coachId" value={coachId} />
      <input type="hidden" name="month" value={month} />
      <input
        type="number"
        name="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.01"
        className="input-field w-20 text-center text-sm"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1.5 bg-primary text-on-primary font-sans text-label-bold text-sm rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50"
        aria-busy={pending}
      >
        {pending ? "..." : "Pagar"}
      </button>
    </form>
  );
}
