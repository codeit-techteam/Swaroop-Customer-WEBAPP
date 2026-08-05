import type { OrdersDisplayStatus } from "@/types/orders-catalog";

/** MVP fulfillment corridor shown on Active Orders and related boards. */
export const ORDER_MVP_STAGES = [
  { id: "created", label: "Ordered" },
  { id: "packed", label: "Packed" },
  { id: "ready", label: "Ready" },
  { id: "transit", label: "Transit" },
  { id: "delivered", label: "Done" },
] as const;

export type OrderMvpStageId = (typeof ORDER_MVP_STAGES)[number]["id"];

/**
 * Warehouse packing track for Processing board — mirrors MVP packing flow
 * before dispatch readiness.
 */
export const PROCESSING_MVP_STAGES = [
  { id: "received", label: "Received" },
  { id: "allocated", label: "Allocated" },
  { id: "packing", label: "Packing" },
  { id: "qc", label: "QC" },
  { id: "packed", label: "Packed" },
] as const;

export type ProcessingMvpStageId = (typeof PROCESSING_MVP_STAGES)[number]["id"];

const DISPLAY_STATUS_STAGE_INDEX: Record<OrdersDisplayStatus, number> = {
  processing: 0,
  packed: 1,
  ready: 2,
  in_transit: 3,
  delayed: 3,
  delivered: 4,
  cancelled: 0,
};

export function orderMvpStageIndex(status: OrdersDisplayStatus): number {
  return DISPLAY_STATUS_STAGE_INDEX[status];
}

export function orderMvpCurrentLabel(status: OrdersDisplayStatus): string {
  if (status === "cancelled") return "Cancelled";
  const index = orderMvpStageIndex(status);
  return ORDER_MVP_STAGES[index]?.label ?? "Ordered";
}

/** Map packing % (or packed status) onto the 5-step processing MVP track. */
export function processingMvpStageIndex(
  percent: number,
  displayStatus: OrdersDisplayStatus,
): number {
  if (displayStatus === "packed") {
    return PROCESSING_MVP_STAGES.length - 1;
  }

  const clamped = Math.max(0, Math.min(100, percent));
  if (clamped >= 100) return 4;
  if (clamped >= 75) return 3;
  if (clamped >= 50) return 2;
  if (clamped >= 25) return 1;
  return 0;
}

export function processingMvpCurrentLabel(
  percent: number,
  displayStatus: OrdersDisplayStatus,
): string {
  const index = processingMvpStageIndex(percent, displayStatus);
  return PROCESSING_MVP_STAGES[index]?.label ?? "Received";
}
