import type { ImportShipment, ImportShipmentStatus } from "@/types/import";

export const SHIPMENT_STATUSES: ImportShipmentStatus[] = [
  "BOOKED",
  "SHIPPED",
  "IN_TRANSIT",
  "ARRIVED",
  "CUSTOMS_CLEARANCE",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "EXCEPTION",
  "CANCELLED",
];

const TERMINAL: ImportShipmentStatus[] = ["DELIVERED", "CANCELLED"];

export const isShipmentTerminal = (status: ImportShipmentStatus) =>
  TERMINAL.includes(status);

type StepKey =
  | "confirmed"
  | "booked"
  | "shipped"
  | "transit"
  | "arrived"
  | "delivery"
  | "delivered";

const STEPS: Array<{
  key: StepKey;
  label: string;
  statuses: ImportShipmentStatus[];
}> = [
  { key: "confirmed", label: "Order confirmed", statuses: [] },
  { key: "booked", label: "Shipment booked", statuses: ["BOOKED"] },
  { key: "shipped", label: "Shipped / picked up", statuses: ["SHIPPED"] },
  { key: "transit", label: "In transit", statuses: ["IN_TRANSIT"] },
  {
    key: "arrived",
    label: "Arrived / customs",
    statuses: ["ARRIVED", "CUSTOMS_CLEARANCE"],
  },
  {
    key: "delivery",
    label: "Out for delivery",
    statuses: ["OUT_FOR_DELIVERY"],
  },
  { key: "delivered", label: "Delivered", statuses: ["DELIVERED"] },
];

const stepIndexOf = (status: ImportShipmentStatus) =>
  STEPS.findIndex((s) => s.statuses.includes(status));

export type TimelineStep = {
  key: StepKey;
  label: string;
  state: "done" | "current" | "upcoming";
  at: string | null;
};

/**
 * Customer tracking steps from the server status and event log only.
 * Exception / cancelled shipments keep the furthest step actually reached;
 * steps a shipment skipped (e.g. SHIPPED → ARRIVED) count as passed.
 */
export function shipmentTimeline(
  shipment: ImportShipment,
  dealConfirmedAt?: string | null,
): TimelineStep[] {
  let reached = stepIndexOf(shipment.status);
  if (reached < 0) {
    reached = Math.max(
      stepIndexOf("BOOKED"),
      ...shipment.events.map((e) => stepIndexOf(e.status)),
    );
  }
  const delivered = shipment.status === "DELIVERED";
  return STEPS.map((step, index) => {
    const at =
      step.key === "confirmed"
        ? (dealConfirmedAt ?? null)
        : (shipment.events.find((e) => step.statuses.includes(e.status))
            ?.occurredAt ??
          (step.key === "booked" ? shipment.createdAt : null));
    const state =
      index < reached || (delivered && index === reached)
        ? "done"
        : index === reached
          ? "current"
          : "upcoming";
    return { key: step.key, label: step.label, state, at };
  });
}
