/**
 * Shipment Tracking catalog — enterprise logistics module for B2B procurement.
 * Frontend-only domain types (no API).
 */

export type ShipmentStatus =
  | "ready_for_dispatch"
  | "vehicle_assigned"
  | "dispatched"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "delayed";

export type ShipmentDocType =
  | "invoice"
  | "eway_bill"
  | "delivery_challan"
  | "lr_copy"
  | "packing_list"
  | "transport_receipt";

export type ShipmentDocStatus = "generated" | "downloaded" | "pending";

export type DeliveryUpdateType =
  "info" | "checkpoint" | "delay" | "reschedule" | "delivered" | "alert";

export type TimelineStageStatus = "completed" | "current" | "pending";

export type ShipmentNotificationType =
  | "vehicle_assigned"
  | "shipment_started"
  | "reached_checkpoint"
  | "delivery_tomorrow"
  | "delivered";

export interface RouteStop {
  city: string;
  state?: string;
  status: TimelineStageStatus;
  arrivedAt?: string | null;
}

export interface ShipmentTimelineStage {
  id: string;
  title: string;
  description: string;
  date: string | null;
  time: string | null;
  status: TimelineStageStatus;
  icon:
    | "check"
    | "package"
    | "credit"
    | "box"
    | "truck"
    | "load"
    | "dispatch"
    | "map"
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
  gpsEnabled: boolean;
  driverName: string;
  driverMobile: string;
  driverLicense: string;
  transportCompany: string;
}

export interface DeliveryEstimate {
  estimatedDelivery: string;
  remainingHours: number;
  currentCity: string;
  destination: string;
  weatherStatus: string;
  trafficIndicator: "clear" | "moderate" | "heavy";
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
  gpsEnabled: boolean;
  dispatchDate: string | null;
  eta: string;
  remainingDistanceKm: number;
  currentStatus: ShipmentStatus;
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
  inTransit: number;
  expectedToday: number;
  deliveredThisWeek: number;
  delayedShipments: number;
}

export interface ShipmentFiltersState {
  search: string;
  status: ShipmentStatus | "all";
  warehouse: string | "all";
  transportCompany: string | "all";
  seller: string | "all";
  destinationState: string | "all";
  expectedDateFrom: string;
  expectedDateTo: string;
}

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  ready_for_dispatch: "Ready For Dispatch",
  vehicle_assigned: "Vehicle Assigned",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  out_for_delivery: "Out For Delivery",
  delivered: "Delivered",
  delayed: "Delayed",
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
  seller: "all",
  destinationState: "all",
  expectedDateFrom: "",
  expectedDateTo: "",
};
