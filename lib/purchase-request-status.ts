import type { PurchaseRequestStatus } from "@/types/dashboard";
import type { StatusTone } from "@/utils/statusColor";

export const PURCHASE_REQUEST_STATUS_LABELS: Record<
  PurchaseRequestStatus,
  string
> = {
  pending_seller_approval: "Pending Confirmation",
  approved: "Approved",
  processing: "Processing",
  ready_for_dispatch: "Ready for Dispatch",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PURCHASE_REQUEST_STATUS_TONE: Record<
  PurchaseRequestStatus,
  StatusTone
> = {
  pending_seller_approval: "warning",
  approved: "success",
  processing: "info",
  ready_for_dispatch: "info",
  in_transit: "info",
  delivered: "success",
  cancelled: "danger",
};

export function getPurchaseRequestStatusLabel(
  status: PurchaseRequestStatus,
): string {
  return PURCHASE_REQUEST_STATUS_LABELS[status];
}
