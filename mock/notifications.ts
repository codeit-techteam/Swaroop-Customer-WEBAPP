import type { ActivityItem } from "@/types/dashboard";
import { ROUTES, purchaseRequestsFiltered } from "@/constants";

/**
 * Recent activity timeline — mirrors Customer App notification/toast themes
 * using web MVP Purchase Request language. Used by Dashboard.
 */
export const recentActivityMock: ActivityItem[] = [
  {
    id: "act-1",
    type: "shipment_update",
    title: "Shipment Update",
    description: "Order #ORD-99231 has departed Mundra Port.",
    timestamp: "2026-07-31T10:02:00.000Z",
    relativeTime: "15 minutes ago",
    href: ROUTES.shipmentTracking,
  },
  {
    id: "act-2",
    type: "seller_approved",
    title: "Order Confirmed",
    description: "Purchase request #PR-98822 approved. Order generated.",
    timestamp: "2026-07-31T08:15:00.000Z",
    relativeTime: "2 hours ago",
    href: ROUTES.orders,
  },
  {
    id: "act-3",
    type: "payment_reminder",
    title: "Payment Reminder",
    description: "Outstanding balance on #INV-402 is overdue.",
    timestamp: "2026-07-30T11:15:00.000Z",
    relativeTime: "Yesterday at 16:45",
    href: ROUTES.payments,
  },
  {
    id: "act-4",
    type: "document_available",
    title: "Document Available",
    description: "Tax invoice for #ORD-98822 is ready to download.",
    timestamp: "2026-07-30T06:00:00.000Z",
    relativeTime: "Yesterday",
    href: ROUTES.documentsInvoices,
  },
  {
    id: "act-5",
    type: "purchase_request_submitted",
    title: "Purchase Request Submitted",
    description: "#PR-99104 awaiting order confirmation (15 min window).",
    timestamp: "2026-07-31T09:45:00.000Z",
    relativeTime: "45 minutes ago",
    href: purchaseRequestsFiltered("pending"),
  },
];

export {
  notificationsCatalogMock,
  DEFAULT_NOTIFICATION_FILTERS,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "./notifications-catalog";
