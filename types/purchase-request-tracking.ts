import type {
  PaymentMethodId,
  PurchaseRequestStatus,
} from "./purchase-request";

/** Tracking statuses shown in Active Requests (in-progress pipeline). */
export type ActiveTrackingStatus =
  | "draft"
  | "submitted"
  | "payment_pending"
  | "review_pending"
  | "seller_reviewing"
  | "pending_approval";

export type HistoryTrackingStatus =
  | "completed"
  | "rejected"
  | "expired"
  | "approved"
  | "cancelled"
  | "archived"
  | "withdrawn";

export type TrackingListStatus =
  | ActiveTrackingStatus
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled"
  | "completed"
  | "archived"
  | "withdrawn";

export interface PurchaseRequestTrackingItem {
  id: string;
  displayId: string;
  productId: string;
  productName: string;
  grade: string;
  quantityMt: number;
  sellerName: string;
  warehouse: string;
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  expiredAt: string | null;
  paymentMethodId: PaymentMethodId;
  paymentMethodTitle: string;
  status: TrackingListStatus;
  /** Underlying PR status for store sync. */
  requestStatus: PurchaseRequestStatus;
  expectedExpiryAt: string | null;
  secondsRemaining: number | null;
  orderId: string | null;
  poNumber: string | null;
  orderStatus: string | null;
  totalAmount: number;
  rejectionReason: string | null;
  rejectedBy: string | null;
  canCancel: boolean;
}
