import apiClient from "@/lib/apiClient";
import { iso, num, paginateAll, type Envelope } from "@/lib/api-envelope";
import { shipmentProgressPercent } from "@/lib/shipment-mvp";
import type {
  ShipmentRecord,
  ShipmentStatus,
  ShipmentTimelineStage,
} from "@/types/shipment-tracking";

export type BackendTrackingEvent = {
  id: string;
  status?: string | null;
  location?: string | null;
  description?: string | null;
  occurredAt?: string | null;
};

export type BackendShipment = {
  id: string;
  referenceNumber: string;
  purchaseOrderId?: string | null;
  purchaseOrderReference?: string | null;
  quantity?: unknown;
  unit?: string;
  status?: string;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
  eta?: string | null;
  destinationRegion?: string | null;
  supplier?: { displayName?: string | null };
  trackingEvents?: BackendTrackingEvent[];
  createdAt?: string;
  updatedAt?: string;
};

function mapStatus(status?: string): ShipmentStatus {
  const key = (status ?? "").toUpperCase();
  if (key.includes("DELIVER")) return "delivered";
  if (key.includes("OUT")) return "out_for_delivery";
  if (key.includes("TRANSIT") || key.includes("IN_TRANSIT"))
    return "in_transit";
  if (key.includes("DISPATCH") || key.includes("SHIPPED")) return "dispatched";
  if (key.includes("EXCEPTION") || key.includes("DELAY")) return "in_transit";
  return "ready_for_dispatch";
}

/** Map authoritative backend tracking events — never invent timestamps. */
function timelineFromEvents(
  events: BackendTrackingEvent[],
  currentStatus: ShipmentStatus,
): ShipmentTimelineStage[] {
  if (!events.length) {
    return [
      {
        id: "status",
        title: currentStatus.replace(/_/g, " "),
        description: "No tracking events recorded yet.",
        date: null,
        time: null,
        timestamp: null,
        status: "current",
        icon: "truck",
      },
    ];
  }
  return events.map((e, index) => {
    const at = e.occurredAt ? iso(e.occurredAt) : null;
    const parts = at
      ? {
          date: new Date(at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          time: new Date(at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
      : { date: null, time: null };
    return {
      id: e.id || `evt-${index}`,
      title: (e.status ?? "Update").replace(/_/g, " "),
      description:
        [e.description, e.location].filter(Boolean).join(" · ") ||
        "Status update",
      date: parts.date,
      time: parts.time,
      timestamp: at,
      status: index === events.length - 1 ? "current" : "completed",
      icon: "truck",
    };
  });
}

export function mapShipment(item: BackendShipment): ShipmentRecord {
  const currentStatus = mapStatus(item.status);
  const createdAt = iso(item.createdAt ?? item.dispatchedAt);
  const dispatchDate = item.dispatchedAt ? iso(item.dispatchedAt) : null;
  const expected = item.eta ? iso(item.eta) : null;
  return {
    id: item.id,
    orderNumber: item.purchaseOrderReference ?? item.referenceNumber,
    poNumber: item.purchaseOrderReference ?? item.referenceNumber,
    invoiceNumber: item.referenceNumber,
    product: "Shipment",
    grade: "—",
    quantityMt: num(item.quantity),
    unit: "MT",
    seller: item.supplier?.displayName ?? "ANONYMOUS SUPPLIER",
    warehouse: "—",
    destination: item.destinationRegion ?? "—",
    destinationState: "",
    paymentType: "advance",
    grandTotal: 0,
    vehicleNumber: "—",
    vehicleType: "—",
    truckCapacityMt: 0,
    transportCompany: "—",
    driverName: "—",
    driverMobile: "—",
    driverLicense: "—",
    dispatchDate,
    // ETA only when the backend provided one — never invent.
    expectedDeliveryDate: expected ? expected.slice(0, 10) : "",
    currentStatus,
    eta: expected ?? "",
    remainingDistanceKm: 0,
    currentCity: item.destinationRegion ?? "—",
    progress: shipmentProgressPercent(currentStatus),
    weatherStatus: "—",
    trafficIndicator: "clear",
    remainingHours: 0,
    route: [],
    liveProgress: [],
    timeline: timelineFromEvents(item.trackingEvents ?? [], currentStatus),
    documents: [],
    updates: [],
    createdAt,
    updatedAt: iso(item.updatedAt ?? item.deliveredAt ?? createdAt),
  };
}

export async function fetchCustomerShipments(): Promise<ShipmentRecord[]> {
  const rows = await paginateAll(async (page) => {
    const payload = await apiClient.get<Envelope<BackendShipment[]>>(
      `/customer/shipments?page=${page}&limit=50`,
    );
    return {
      items: payload.data ?? [],
      totalPages: payload.meta?.totalPages ?? 1,
    };
  });
  return rows.map(mapShipment);
}

export async function fetchShipmentTracking(
  shipmentId: string,
): Promise<BackendTrackingEvent[]> {
  const payload = await apiClient.get<Envelope<BackendTrackingEvent[]>>(
    `/customer/shipments/${shipmentId}/tracking`,
  );
  return payload.data ?? [];
}
