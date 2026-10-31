import { ROUTES } from "@/constants";
import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import type {
  AppNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationType,
} from "@/types/notifications";

export type BackendNotificationRow = {
  id: string;
  title: string;
  body: string;
  entityType?: string | null;
  entityId?: string | null;
  displayReference?: string | null;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  status?: string | null;
  createdAt: string;
};

/** Pull live in-app notifications (same API the mobile app uses). */
export async function fetchBackendCustomerNotifications(): Promise<
  BackendNotificationRow[]
> {
  const payload = await apiClient.get<Envelope<BackendNotificationRow[]>>(
    "/customer/notifications?limit=50",
  );
  return payload.data ?? [];
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function priorityFor(isRead: boolean, title: string): NotificationPriority {
  const t = title.toLowerCase();
  if (
    !isRead &&
    (t.includes("required") || t.includes("failed") || t.includes("overdue"))
  ) {
    return "high";
  }
  return isRead ? "low" : "medium";
}

/**
 * Map a backend notification into the Customer Web AppNotification shape,
 * including production deep-links for New Grade Requests.
 */
export function mapBackendNotificationToApp(
  row: BackendNotificationRow,
): AppNotification {
  const metadata = row.metadata ?? {};
  const isRead = Boolean(row.readAt) || row.status === "READ";
  const reference =
    asString(row.displayReference) ??
    asString(metadata.referenceNumber) ??
    asString(metadata.displayReference) ??
    "";

  if (row.entityType === "NEW_GRADE_REQUEST" && row.entityId) {
    return {
      id: row.id,
      type: "account_verification",
      category: "marketplace",
      title: row.title,
      description: row.body,
      fullDescription: row.body,
      referenceNumber: reference || row.entityId,
      status: isRead ? "read" : "unread",
      priority: priorityFor(isRead, row.title),
      createdAt: row.createdAt,
      href: `${ROUTES.marketplaceGradeRequests}/${row.entityId}`,
    };
  }

  let category: NotificationCategory = "system";
  let href: string = ROUTES.dashboard;
  let type: NotificationType = "system_maintenance";
  const title = row.title.toLowerCase();

  if (row.entityType === "PURCHASE_REQUEST" || title.includes("purchase")) {
    category = "purchase_requests";
    type = "purchase_request_submitted";
    href = row.entityId
      ? `${ROUTES.purchaseRequests}/${row.entityId}`
      : ROUTES.purchaseRequests;
  } else if (row.entityType === "ORDER" || title.includes("order")) {
    category = "orders";
    type = "purchase_order_generated";
    href = row.entityId ? `${ROUTES.orders}/${row.entityId}` : ROUTES.orders;
  } else if (
    row.entityType === "SHIPMENT" ||
    title.includes("shipment") ||
    title.includes("dispatch")
  ) {
    category = "shipment";
    type = "shipment_created";
    href = row.entityId
      ? `${ROUTES.shipmentTracking}/${row.entityId}`
      : ROUTES.shipmentTracking;
  } else if (title.includes("payment") || title.includes("credit")) {
    category = "payments";
    type = "payment_received";
    href = ROUTES.payments;
  } else if (title.includes("document") || title.includes("kyc")) {
    category = "documents";
    type = "documents_available";
    href = ROUTES.documents;
  } else if (title.includes("offer")) {
    category = "offers";
    type = "offer_available";
    href = ROUTES.marketplace;
  }

  return {
    id: row.id,
    type,
    category,
    title: row.title,
    description: row.body,
    fullDescription: row.body,
    referenceNumber: reference,
    status: isRead ? "read" : "unread",
    priority: priorityFor(isRead, row.title),
    createdAt: row.createdAt,
    href,
    orderNumber:
      category === "orders" ? (row.entityId ?? undefined) : undefined,
    shipmentId:
      category === "shipment" ? (row.entityId ?? undefined) : undefined,
  };
}
