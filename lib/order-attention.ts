import type { OrdersCatalogItem, OrdersKpiFocus } from "@/types/orders-catalog";

export function isPaymentPending(order: OrdersCatalogItem): boolean {
  return order.paymentStatus === "pending";
}

export function isDelayed(order: OrdersCatalogItem): boolean {
  return order.displayStatus === "delayed";
}

export function isReadyForDispatch(order: OrdersCatalogItem): boolean {
  return order.displayStatus === "ready";
}

export function isProcessing(order: OrdersCatalogItem): boolean {
  return (
    order.displayStatus === "processing" || order.displayStatus === "packed"
  );
}

export function requiresAttention(order: OrdersCatalogItem): boolean {
  return (
    isDelayed(order) || isPaymentPending(order) || isReadyForDispatch(order)
  );
}

/** Specific reasons shown on table rows — never a generic "Requires Attention". */
export function getAttentionReasons(order: OrdersCatalogItem): string[] {
  const reasons: string[] = [];
  if (isPaymentPending(order)) {
    reasons.push("Payment verification pending");
  }
  if (isDelayed(order)) {
    reasons.push("Delivery delayed");
  }
  if (isReadyForDispatch(order)) {
    reasons.push("Dispatch pending");
  }
  return reasons;
}

export function applyKpiFocus(
  orders: OrdersCatalogItem[],
  focus: OrdersKpiFocus,
): OrdersCatalogItem[] {
  switch (focus) {
    case "processing":
      return orders.filter(isProcessing);
    case "attention":
      return orders.filter(requiresAttention);
    case "payment_pending":
      return orders.filter(isPaymentPending);
    case "delayed":
      return orders.filter(isDelayed);
    case "ready_for_dispatch":
      return orders.filter(isReadyForDispatch);
    case "value":
      return [...orders].sort((a, b) => b.grandTotal - a.grandTotal);
    case "all":
    case "none":
    default:
      return orders;
  }
}

export function kpiFocusTitle(focus: OrdersKpiFocus): string {
  switch (focus) {
    case "processing":
      return "Processing Orders";
    case "attention":
      return "Orders Requiring Attention";
    case "payment_pending":
      return "Payment Pending Orders";
    case "delayed":
      return "Delayed Orders";
    case "ready_for_dispatch":
      return "Ready for Dispatch Orders";
    case "value":
      return "Active Orders · Highest Value";
    case "all":
    case "none":
    default:
      return "Active Orders";
  }
}

export function kpiFocusChipLabel(focus: OrdersKpiFocus): string | null {
  switch (focus) {
    case "processing":
      return "Processing";
    case "attention":
      return "Requires Attention";
    case "payment_pending":
      return "Payment Pending";
    case "delayed":
      return "Delayed";
    case "ready_for_dispatch":
      return "Ready for Dispatch";
    case "value":
      return "Highest Value";
    case "all":
    case "none":
    default:
      return null;
  }
}
