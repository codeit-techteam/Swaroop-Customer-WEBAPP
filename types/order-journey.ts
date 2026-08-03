/**
 * Post-approval order journey — mirrors SWAROOP Customer App
 * order / payment / dispatch / shipment / delivery domain.
 */

import type { PaymentMethodId } from "./purchase-request";

export type OrderLifecycleStatus =
  | "order_created"
  | "payment_pending"
  | "payment_verified"
  | "dispatch_ready"
  | "dispatched"
  | "in_transit"
  | "near_destination"
  | "delivered";

export type OrderPaymentStatus =
  "pending" | "submitted" | "verified" | "not_required_yet" | "outstanding";

export type ShipmentTimelineStepId =
  "ready" | "dispatched" | "in_transit" | "near_destination" | "delivered";

export type TimelineStepStatus = "completed" | "current" | "pending";

export interface ShipmentTimelineStep {
  id: ShipmentTimelineStepId;
  title: string;
  status: TimelineStepStatus;
  timestamp?: string | null;
}

export interface CustomerOrder {
  id: string;
  poNumber: string;
  purchaseRequestId: string;
  purchaseRequestDisplayId: string;
  productId: string;
  productName: string;
  grade: string;
  quantityMt: number;
  warehouse: string;
  destination: string;
  paymentMethodId: PaymentMethodId;
  paymentMethodTitle: string;
  amount: number;
  baseAmount: number;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderLifecycleStatus;
  expectedDispatch: string;
  eta: string;
  invoiceNumber: string | null;
  receiptNumber: string | null;
  createdAt: string;
  updatedAt: string;
  discount: number;
  interestAmount: number;
  interestRate: number;
  creditLimit: number | null;
  availableCredit: number | null;
  creditUsed: number | null;
  dueDate: string | null;
  productImageUrl: string;
  packaging: string;
  gstNumber: string;
}

export interface DispatchDetails {
  orderId: string;
  vehicleNumber: string;
  driverName: string;
  driverContactMasked: string;
  warehouse: string;
  loadingStatus: string;
  expectedDispatch: string;
  transportPartner: string;
  currentLocation: string;
  dispatchTime: string | null;
}

export interface ShipmentTracking {
  orderId: string;
  currentStep: ShipmentTimelineStepId;
  steps: ShipmentTimelineStep[];
  mapPlaceholder: true;
  progress: number;
}

export interface DeliveryDetails {
  orderId: string;
  deliveredAt: string;
  receiverName: string;
  receiverMobileMasked: string;
  companyName: string;
  deliveryAddress: string;
  podId: string;
  otpVerified: boolean;
  condition: "good";
  noDamageReported: boolean;
}

export interface RejectionInfo {
  requestId: string;
  displayId: string;
  reason: string;
  suggestedAction: string;
  rejectedAt: string;
}

export type { PaymentMethodId };
