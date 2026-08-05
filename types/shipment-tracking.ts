/**
 * Shipment Tracking catalog — MVP status/stage-based logistics module.
 * Frontend-only domain types (no API / GPS / live maps).
 */

export type ShipmentStatus =
  | "ready_for_dispatch"
  | "dispatched"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

/** Clickable KPI focus on the Track Shipment dashboard. */
export type ShipmentKpiFocus =
  | "none"
  | "active"
  | "ready_for_dispatch"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

export type ShipmentDocType =
  | "invoice"
  | "eway_bill"
  | "delivery_challan"
  | "lr_copy"
  | "packing_list"
  | "transport_receipt";

export type ShipmentDocStatus = "generated" | "downloaded" | "pending";

export type DeliveryUpdateType =
  "info" | "checkpoint" | "reschedule" | "delivered" | "alert";

export type TimelineStageStatus = "completed" | "current" | "pending";

export type ShipmentNotificationType =
  | "vehicle_assigned"
  | "shipment_dispatched"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

export type MvpTimelineStageId =
  | "order_confirmed"
  | "ready_for_dispatch"
  | "dispatched"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

export interface RouteStop {
  city: string;
  state?: string;
  status: TimelineStageStatus;
  arrivedAt?: string | null;
}

export interface ShipmentTimelineStage {
  id: MvpTimelineStageId;
  title: string;
  description: string;
  date: string | null;
  time: string | null;
  timestamp: string | null;
  status: TimelineStageStatus;
  icon:
    | "check"
    | "package"
    | "box"
    | "truck"
    | "dispatch"
    | "transit"
    | "pin"
    | "delivered";
}

export interface LiveProgressStep {
  id: string;
  label: string;
  status: TimelineStageStatus;
}

export interface VehicleDetails {
  vehicleNumber: string;
  truckType: string;
  capacityMt: number;
  driverName: string;
  driverMobile: string;
  driverLicense: string;
  transportCompany: string;
}

export interface TransportDocument {
  id: string;
  type: ShipmentDocType;
  title: string;
  fileName: string;
  status: ShipmentDocStatus;
  generatedAt: string | null;
  sizeKb: number;
}

export interface DeliveryUpdate {
  id: string;
  shipmentId: string;
  orderNumber: string;
  message: string;
  date: string;
  time: string;
  type: DeliveryUpdateType;
  driver: string;
  location?: string;
}

export interface ShipmentNotification {
  id: string;
  shipmentId: string;
  orderNumber: string;
  type: ShipmentNotificationType;
  title: string;
  message: string;
  at: string;
  read: boolean;
}

export interface ShipmentRecord {
  id: string;
  orderNumber: string;
  poNumber: string;
  invoiceNumber: string;
  product: string;
  grade: string;
  quantityMt: number;
  unit: "MT";
  seller: string;
  warehouse: string;
  destination: string;
  destinationState: string;
  paymentType: string;
  grandTotal: number;
  vehicleNumber: string;
  vehicleType: string;
  truckCapacityMt: number;
  transportCompany: string;
  driverName: string;
  driverMobile: string;
  driverLicense: string;
  /** Display-only expected delivery date (ISO). Not computed live. */
  dispatchDate: string | null;
  expectedDeliveryDate: string;
  currentStatus: ShipmentStatus;
  /** @deprecated Prefer expectedDeliveryDate — kept for older consumers */
  eta: string;
  remainingDistanceKm: number;
  currentCity: string;
  progress: number;
  weatherStatus: string;
  trafficIndicator: "clear" | "moderate" | "heavy";
  remainingHours: number;
  route: RouteStop[];
  liveProgress: LiveProgressStep[];
  timeline: ShipmentTimelineStage[];
  documents: TransportDocument[];
  updates: DeliveryUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentDashboardSummary {
  activeShipments: number;
  readyForDispatch: number;
  inTransit: number;
  outForDelivery: number;
  delivered: number;
}

export interface ShipmentFiltersState {
  search: string;
  status: ShipmentStatus | "all";
  warehouse: string | "all";
  transportCompany: string | "all";
  destinationState: string | "all";
}

export const MVP_SHIPMENT_TIMELINE: ReadonlyArray<{
  id: MvpTimelineStageId;
  title: string;
  description: string;
  icon: ShipmentTimelineStage["icon"];
}> = [
  {
    id: "order_confirmed",
    title: "Order Confirmed",
    description:
      "Order confirmed and handed to logistics for dispatch planning.",
    icon: "check",
  },
  {
    id: "ready_for_dispatch",
    title: "Ready for Dispatch",
    description: "Material staged at warehouse and awaiting dispatch.",
    icon: "box",
  },
  {
    id: "dispatched",
    title: "Dispatched",
    description: "Shipment left the warehouse gate.",
    icon: "dispatch",
  },
  {
    id: "in_transit",
    title: "In Transit",
    description: "Shipment is on the corridor to the destination.",
    icon: "transit",
  },
  {
    id: "out_for_delivery",
    title: "Out for Delivery",
    description: "Final delivery stage — vehicle approaching buyer site.",
    icon: "pin",
  },
  {
    id: "delivered",
    title: "Delivered",
    description: "Material delivered and POD captured.",
    icon: "delivered",
  },
];

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  ready_for_dispatch: "Ready for Dispatch",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export const SHIPMENT_DOC_LABELS: Record<ShipmentDocType, string> = {
  invoice: "Invoice",
  eway_bill: "E-Way Bill",
  delivery_challan: "Delivery Challan",
  lr_copy: "LR Copy",
  packing_list: "Packing List",
  transport_receipt: "Transport Receipt",
};

export const DEFAULT_SHIPMENT_FILTERS: ShipmentFiltersState = {
  search: "",
  status: "all",
  warehouse: "all",
  transportCompany: "all",
  destinationState: "all",
};

/** Statuses counted as active (not yet completed). */
export const ACTIVE_SHIPMENT_STATUSES: readonly ShipmentStatus[] = [
  "ready_for_dispatch",
  "dispatched",
  "in_transit",
  "out_for_delivery",
] as const;
