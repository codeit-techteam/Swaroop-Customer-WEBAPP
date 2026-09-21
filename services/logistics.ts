import apiClient from "@/lib/apiClient";
import { iso, num, paginateAll, type Envelope } from "@/lib/api-envelope";
import { buildMvpTimeline } from "@/mock/shipment-tracking";
import { shipmentProgressPercent } from "@/lib/shipment-mvp";
import type { ShipmentRecord, ShipmentStatus } from "@/types/shipment-tracking";

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
  createdAt?: string;
  updatedAt?: string;
};

function mapStatus(status?: string): ShipmentStatus {
  const key = (status ?? "").toUpperCase();
  if (key.includes("DELIVER")) return "delivered";
  if (key.includes("OUT")) return "out_for_delivery";
  if (key.includes("TRANSIT")) return "in_transit";
  if (key.includes("DISPATCH")) return "dispatched";
  return "ready_for_dispatch";
}

export function mapShipment(item: BackendShipment): ShipmentRecord {
  const currentStatus = mapStatus(item.status);
  const createdAt = iso(item.createdAt ?? item.dispatchedAt);
  const dispatchDate = item.dispatchedAt ? iso(item.dispatchedAt) : null;
  const expected = item.eta ? iso(item.eta) : createdAt;
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
    warehouse: "Assigned hub",
    destination: item.destinationRegion ?? "Assigned destination",
    destinationState: "",
    paymentType: "advance",
    grandTotal: 0,
    vehicleNumber: "—",
    vehicleType: "Truck",
    truckCapacityMt: 0,
    transportCompany: "Assigned transporter",
    driverName: "Assigned driver",
    driverMobile: "—",
    driverLicense: "—",
    dispatchDate,
    expectedDeliveryDate: expected.slice(0, 10),
    currentStatus,
    eta: expected,
    remainingDistanceKm: currentStatus === "delivered" ? 0 : 0,
    currentCity: item.destinationRegion ?? "In transit",
    progress: shipmentProgressPercent(currentStatus),
    weatherStatus: "—",
    trafficIndicator: "clear",
    remainingHours: currentStatus === "delivered" ? 0 : 24,
    route: [
      { city: "Origin hub", status: "completed" },
      {
        city: item.destinationRegion ?? "Destination",
        status: currentStatus === "delivered" ? "completed" : "current",
      },
    ],
    liveProgress: [],
    timeline: buildMvpTimeline(currentStatus, createdAt, dispatchDate),
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
    return { items: payload.data ?? [], totalPages: payload.meta?.totalPages ?? 1 };
  });
  return rows.map(mapShipment);
}
