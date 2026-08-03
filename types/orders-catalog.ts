import type { PaymentMethodId } from "./purchase-request";

/** Sidebar / list display statuses for Orders module. */
export type OrdersDisplayStatus =
  "processing" | "packed" | "ready" | "in_transit" | "delivered" | "cancelled";

export type OrdersSortBy =
  "newest" | "oldest" | "amount_desc" | "amount_asc" | "delivery_date";

export type DeliveryType = "road" | "container" | "bulk_tanker";

export interface OrderTimelineEvent {
  id: string;
  title: string;
  status: "completed" | "current" | "pending";
  at: string | null;
}

export interface OrdersCatalogItem {
  id: string;
  poNumber: string;
  productId: string;
  productName: string;
  grade: string;
  productImageUrl: string;
  sellerName: string;
  warehouse: string;
  quantityMt: number;
  pricePerMt: number;
  gstAmount: number;
  freightAmount: number;
  insuranceAmount: number;
  grandTotal: number;
  paymentMethodId: PaymentMethodId;
  paymentMethodTitle: string;
  paymentStatus: "pending" | "verified" | "outstanding" | "refunded" | "waived";
  displayStatus: OrdersDisplayStatus;
  progress: number;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
  destination: string;
  currentLocation: string | null;
  distanceRemainingKm: number | null;
  etaLabel: string;
  vehicleNumber: string | null;
  transporter: string | null;
  driverName: string | null;
  driverContact: string | null;
  loadingSlot: string | null;
  dispatchDate: string | null;
  packingTeam: string | null;
  processingPercent: number | null;
  estimatedCompletion: string | null;
  expectedDispatch: string | null;
  deliveredAt: string | null;
  receiverName: string | null;
  invoiceNumber: string | null;
  ewayBillNumber: string | null;
  podId: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  cancelledBy: string | null;
  refundStatus: string | null;
  previousPricePerMt: number | null;
  currentPricePerMt: number | null;
  availability: "in_stock" | "limited" | "out_of_stock";
  deliveryType: DeliveryType;
  timeline: OrderTimelineEvent[];
}
