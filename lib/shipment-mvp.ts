/**
 * Shipment Tracking MVP helpers — status → timeline index, KPI focus, filters.
 */

import {
  ACTIVE_SHIPMENT_STATUSES,
  MVP_SHIPMENT_TIMELINE,
  SHIPMENT_STATUS_LABELS,
  type ShipmentDashboardSummary,
  type ShipmentKpiFocus,
  type ShipmentRecord,
  type ShipmentStatus,
} from "@/types/shipment-tracking";

/** Map shipment status → index in MVP_SHIPMENT_TIMELINE (skips order_confirmed at 0). */
export function shipmentStatusTimelineIndex(status: ShipmentStatus): number {
  switch (status) {
    case "ready_for_dispatch":
      return 1;
    case "dispatched":
      return 2;
    case "in_transit":
      return 3;
    case "out_for_delivery":
      return 4;
    case "delivered":
      return 5;
    default:
      return 1;
  }
}

export function isActiveShipment(shipment: ShipmentRecord): boolean {
  return ACTIVE_SHIPMENT_STATUSES.includes(shipment.currentStatus);
}

export function computeShipmentSummary(
  shipments: ShipmentRecord[],
): ShipmentDashboardSummary {
  return {
    activeShipments: shipments.filter(isActiveShipment).length,
    readyForDispatch: shipments.filter(
      (s) => s.currentStatus === "ready_for_dispatch",
    ).length,
    inTransit: shipments.filter((s) => s.currentStatus === "in_transit").length,
    outForDelivery: shipments.filter(
      (s) => s.currentStatus === "out_for_delivery",
    ).length,
    delivered: shipments.filter((s) => s.currentStatus === "delivered").length,
  };
}

export function applyShipmentKpiFocus(
  shipments: ShipmentRecord[],
  focus: ShipmentKpiFocus,
): ShipmentRecord[] {
  switch (focus) {
    case "active":
      return shipments.filter(isActiveShipment);
    case "ready_for_dispatch":
      return shipments.filter((s) => s.currentStatus === "ready_for_dispatch");
    case "in_transit":
      return shipments.filter((s) => s.currentStatus === "in_transit");
    case "out_for_delivery":
      return shipments.filter((s) => s.currentStatus === "out_for_delivery");
    case "delivered":
      return shipments.filter((s) => s.currentStatus === "delivered");
    case "none":
    default:
      return shipments;
  }
}

export function shipmentKpiFocusTitle(focus: ShipmentKpiFocus): string {
  switch (focus) {
    case "active":
      return "Active Shipments";
    case "ready_for_dispatch":
      return "Ready for Dispatch Shipments";
    case "in_transit":
      return "In Transit Shipments";
    case "out_for_delivery":
      return "Out for Delivery Shipments";
    case "delivered":
      return "Delivered Shipments";
    case "none":
    default:
      return "All Shipments";
  }
}

export function shipmentKpiFocusChipLabel(
  focus: ShipmentKpiFocus,
): string | null {
  switch (focus) {
    case "active":
      return "Active";
    case "ready_for_dispatch":
      return SHIPMENT_STATUS_LABELS.ready_for_dispatch;
    case "in_transit":
      return SHIPMENT_STATUS_LABELS.in_transit;
    case "out_for_delivery":
      return SHIPMENT_STATUS_LABELS.out_for_delivery;
    case "delivered":
      return SHIPMENT_STATUS_LABELS.delivered;
    case "none":
    default:
      return null;
  }
}

export function shipmentProgressPercent(status: ShipmentStatus): number {
  const idx = shipmentStatusTimelineIndex(status);
  return Math.round((idx / (MVP_SHIPMENT_TIMELINE.length - 1)) * 100);
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** e.g. 04 Aug 2026 */
export function formatShipmentDate(isoDate: string | null | undefined): string {
  if (!isoDate) return "Pending";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "Pending";
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** e.g. 04 Aug · 2:15 PM */
export function formatShipmentDateTime(
  isoDate: string | null | undefined,
): string {
  if (!isoDate) return "Pending";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "Pending";
  const day = String(d.getDate()).padStart(2, "0");
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${day} ${MONTHS[d.getMonth()]} · ${h12}:${minutes} ${ampm}`;
}
