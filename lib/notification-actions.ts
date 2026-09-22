import { ROUTES, purchaseRequestsFiltered } from "@/constants";
import type {
  AppNotification,
  NotificationActionType,
  NotificationCategory,
  NotificationType,
} from "@/types/notifications";

const INVOICE_TYPES = new Set<NotificationType>([
  "invoice_generated",
  "gst_invoice_ready",
  "receipt_ready",
]);

/** Business categories shown in the MVP notification drawer. */
export const MVP_NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "orders",
  "purchase_requests",
  "seller_approval",
  "payments",
  "shipment",
  "documents",
  "promotions",
  "offers",
  "marketplace",
];

export function isMvpNotification(n: AppNotification): boolean {
  return (
    n.status !== "deleted" &&
    n.category !== "system" &&
    MVP_NOTIFICATION_CATEGORIES.includes(n.category)
  );
}

export function resolveNotificationActionType(
  n: AppNotification,
): NotificationActionType {
  switch (n.category) {
    case "orders":
      return "viewOrder";
    case "purchase_requests":
    case "seller_approval":
      return "viewOrder";
    case "payments":
      return "viewPayment";
    case "shipment":
      return "trackShipment";
    case "documents":
      return INVOICE_TYPES.has(n.type) ? "downloadInvoice" : "viewDocument";
    case "promotions":
    case "offers":
    case "marketplace":
      return "viewOffer";
    case "system":
    default:
      return "viewDocument";
  }
}

export function getNotificationActionLabel(
  actionType: NotificationActionType,
  category?: NotificationCategory,
): string {
  if (category === "purchase_requests" || category === "seller_approval") {
    return "View Request";
  }
  switch (actionType) {
    case "viewOrder":
      return "View Order";
    case "trackShipment":
      return "Track Shipment";
    case "viewPayment":
      return "View Payment";
    case "downloadInvoice":
      return "Download Invoice";
    case "viewOffer":
      return "View Offer";
    case "viewDocument":
      return "View Document";
    case "openSupportTicket":
      return "Open Ticket";
    default:
      return "View";
  }
}

/** Prefer stored href; fall back to category-based routes. */
export function getNotificationHref(n: AppNotification): string {
  if (n.href && !n.href.startsWith("/notifications")) return n.href;

  const action = resolveNotificationActionType(n);
  switch (action) {
    case "viewOrder":
      if (
        n.category === "purchase_requests" ||
        n.category === "seller_approval"
      ) {
        return purchaseRequestsFiltered("active");
      }
      return n.orderNumber
        ? `${ROUTES.orders}/${n.orderNumber}`
        : ROUTES.orders;
    case "trackShipment":
      return n.shipmentId
        ? `${ROUTES.shipmentTracking}/${n.shipmentId}`
        : ROUTES.shipmentTracking;
    case "viewPayment":
      return n.paymentId
        ? `${ROUTES.payments}/${n.paymentId}`
        : ROUTES.payments;
    case "downloadInvoice":
      return ROUTES.documentsInvoices;
    case "viewOffer":
      return ROUTES.marketplace;
    case "viewDocument":
      return ROUTES.documents;
    case "openSupportTicket":
      return ROUTES.supportTickets;
    default:
      return ROUTES.dashboard;
  }
}

export function getNotificationReference(n: AppNotification): string | null {
  return (
    n.orderNumber ||
    n.poNumber ||
    n.invoiceNumber ||
    n.shipmentId ||
    n.paymentId ||
    n.referenceNumber ||
    null
  );
}
