import type {
  CustomerOrder,
  OrderLifecycleStatus,
} from "@/types/order-journey";
import type { PaymentMethodId } from "@/types/purchase-request";
import { ROUTES } from "@/constants";

export function orderPath(orderId: string): string {
  return `${ROUTES.orderDetail}/${orderId}`;
}

export function paymentPath(orderId: string): string {
  return `${ROUTES.paymentDetail}/${orderId}`;
}

export function dispatchPath(orderId: string): string {
  return `${ROUTES.dispatchDetail}/${orderId}`;
}

export function shipmentPath(orderId: string): string {
  return `${ROUTES.shipmentTracking}/${orderId}`;
}

/** After order details — always payment process (method-specific UI). */
export function getRouteAfterOrderDetails(orderId: string): string {
  return paymentPath(orderId);
}

/**
 * After payment process Continue — mirrors mobile branching simplified for desktop:
 * advance / on_loading / credit / on_delivery → dispatch
 */
export function getRouteAfterPaymentProcess(
  _methodId: PaymentMethodId,
  orderId: string,
): string {
  return dispatchPath(orderId);
}

export function getRouteAfterDispatch(orderId: string): string {
  return shipmentPath(orderId);
}

export function getOrderPrimaryCtaLabel(order: CustomerOrder): string {
  switch (order.paymentMethodId) {
    case "advance":
      return "Proceed to Advance Payment";
    case "on_loading":
      return "Proceed to Loading Payment";
    case "on_delivery":
      return "Continue to Payment Terms";
    case "credit_15":
    case "credit_30":
      return "Review Credit Terms";
    default:
      return "Proceed to Payment";
  }
}

export function statusLabel(status: OrderLifecycleStatus): string {
  const map: Record<OrderLifecycleStatus, string> = {
    order_created: "Order Created",
    payment_pending: "Payment Pending",
    payment_verified: "Payment Verified",
    dispatch_ready: "Ready for Dispatch",
    dispatched: "Dispatched",
    in_transit: "In Transit",
    near_destination: "Near Destination",
    delivered: "Delivered",
  };
  return map[status];
}
