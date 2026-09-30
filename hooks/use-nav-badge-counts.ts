"use client";

import { useMemo } from "react";
import { ACTIVE_STATUSES } from "@/mock/purchase-request/trackingRequests";
import { ACTIVE_ORDER_STATUSES } from "@/mock/orders-catalog";
import { isActiveShipment } from "@/lib/shipment-mvp";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";
import { useOrdersCatalogStore } from "@/store/ordersCatalogStore";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";
import { useShipmentTrackingStore } from "@/store/shipmentTrackingStore";
import type { PaymentStatus } from "@/types/payments";

const SETTLED_PAYMENT_STATUSES: PaymentStatus[] = [
  "paid",
  "verified",
  "cancelled",
  "refunded",
];

/** Live sidebar badge counts keyed by nav item id. Zero means no badge. */
export function useNavBadgeCounts(): Record<string, number> {
  const purchaseRequests = usePurchaseRequestTrackingStore((s) => s.items);
  const orders = useOrdersCatalogStore((s) => s.items);
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const shipments = useShipmentTrackingStore((s) => s.shipments);

  return useMemo(
    () => ({
      "purchase-requests": purchaseRequests.filter((r) =>
        ACTIVE_STATUSES.includes(r.status),
      ).length,
      orders: orders.filter((o) =>
        ACTIVE_ORDER_STATUSES.includes(o.displayStatus),
      ).length,
      payments: payments.filter(
        (p) => !SETTLED_PAYMENT_STATUSES.includes(p.status),
      ).length,
      "shipment-tracking": shipments.filter(isActiveShipment).length,
    }),
    [purchaseRequests, orders, payments, shipments],
  );
}
