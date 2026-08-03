import type { PaymentTimelineStep } from "@/types/payments";

export function advanceTimelineAfterSubmit(
  timeline: PaymentTimelineStep[],
  at: string,
  utr: string,
): PaymentTimelineStep[] {
  const completedIds = new Set([
    "purchase_request",
    "seller_approved",
    "order_generated",
    "advance_pending",
    "payment_submitted",
    "utr_uploaded",
  ]);

  return timeline.map((step) => {
    if (completedIds.has(step.id)) {
      return {
        ...step,
        status: "completed" as const,
        at: step.at ?? at,
        description:
          step.id === "utr_uploaded" ? `UTR: ${utr}` : step.description,
      };
    }
    if (step.id === "finance_verification") {
      return { ...step, status: "current" as const };
    }
    return step;
  });
}

export function markTimelineVerified(
  timeline: PaymentTimelineStep[],
  at: string,
): PaymentTimelineStep[] {
  return timeline.map((step) => ({
    ...step,
    status: "completed" as const,
    at: step.at ?? at,
  }));
}
