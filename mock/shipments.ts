import type {
  DeliveryDetails,
  DispatchDetails,
  ShipmentTimelineStep,
  ShipmentTimelineStepId,
  ShipmentTracking,
} from "@/types/order-journey";

/** Mirrors SWAROOP `DEFAULT_SHIPMENT_DETAILS`. */
export const DEFAULT_VEHICLE = {
  vehicleNumber: "MH-04-AB-2291",
  driverName: "Rajesh Kumar",
  driverContactMasked: "+91 ******8421",
  currentLocation: "Near Mumbai Warehouse",
  transportPartner: "Verified Logistics Partner",
} as const;

export const SHIPMENT_STEP_SEQUENCE: ShipmentTimelineStepId[] = [
  "ready",
  "dispatched",
  "in_transit",
  "near_destination",
  "delivered",
];

const STEP_TITLES: Record<ShipmentTimelineStepId, string> = {
  ready: "Ready",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  near_destination: "Near Destination",
  delivered: "Delivered",
};

export const DISPATCH_COPY = {
  headerTitle: "Dispatch",
  successTitle: "Shipment Ready for Dispatch",
  subtitle:
    "Vehicle and driver assigned. Loading confirmation completed at warehouse.",
  continueLabel: "View Shipment Status",
  backLabel: "Back to Payment",
} as const;

export const SHIPMENT_COPY = {
  headerTitle: "Shipment Status",
  continueLabel: "Advance Status",
  deliveredContinue: "View Delivery",
} as const;

export const DELIVERY_COPY = {
  headerTitle: "Delivered",
  successTitle: "Shipment Delivered Successfully",
  successSubtitle:
    "Your shipment has been successfully delivered and received. Thank you for choosing PetroTrade.",
  rateLabel: "Rate Delivery",
  repeatLabel: "Repeat Purchase",
  downloadInvoice: "Download Invoice",
  downloadReceipt: "Download Receipt",
  downloadDocs: "Download Documents",
} as const;

export function createShipmentTimeline(
  currentStep: ShipmentTimelineStepId,
  timestamps?: Partial<Record<ShipmentTimelineStepId, string>>,
): ShipmentTimelineStep[] {
  const currentIndex = SHIPMENT_STEP_SEQUENCE.indexOf(currentStep);
  return SHIPMENT_STEP_SEQUENCE.map((id, index) => ({
    id,
    title: STEP_TITLES[id],
    status:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "pending",
    timestamp: timestamps?.[id] ?? null,
  }));
}

export function progressForStep(step: ShipmentTimelineStepId): number {
  const index = SHIPMENT_STEP_SEQUENCE.indexOf(step);
  if (index < 0) return 0;
  return Math.round((index / (SHIPMENT_STEP_SEQUENCE.length - 1)) * 100);
}

export function createDispatchDetails(
  orderId: string,
  warehouse: string,
  expectedDispatch: string,
): DispatchDetails {
  return {
    orderId,
    vehicleNumber: DEFAULT_VEHICLE.vehicleNumber,
    driverName: DEFAULT_VEHICLE.driverName,
    driverContactMasked: DEFAULT_VEHICLE.driverContactMasked,
    warehouse,
    loadingStatus: "Loading Completed",
    expectedDispatch,
    transportPartner: DEFAULT_VEHICLE.transportPartner,
    currentLocation: DEFAULT_VEHICLE.currentLocation,
    dispatchTime: null,
  };
}

export function createShipmentTracking(orderId: string): ShipmentTracking {
  return {
    orderId,
    currentStep: "ready",
    steps: createShipmentTimeline("ready"),
    mapPlaceholder: true,
    progress: progressForStep("ready"),
  };
}

export function createDeliveryDetails(
  orderId: string,
  destination: string,
): DeliveryDetails {
  const deliveredAt = new Date().toISOString();
  const cityPart = destination.split(",")[0]?.trim() || "Mumbai";
  return {
    orderId,
    deliveredAt,
    receiverName: "Amit Sharma",
    receiverMobileMasked: "+91 ******7294",
    companyName: `${cityPart} Industries Pvt. Ltd.`,
    deliveryAddress: destination,
    podId: `PT-POD-${orderId.replace(/^PT-ORD-/, "")}`,
    otpVerified: true,
    condition: "good",
    noDamageReported: true,
  };
}

export const shipmentsMock: never[] = [];
