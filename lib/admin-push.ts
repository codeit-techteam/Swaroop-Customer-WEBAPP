import { env } from "@/lib/env";
import { useNotificationsCatalogStore } from "@/store/notificationsCatalogStore";
import type {
  AppNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationType,
} from "@/types/notifications";

export interface AdminPushPayload {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: "HIGH" | "NORMAL" | "LOW" | string;
  platforms: string[];
  ctaText?: string;
  ctaAction: string;
  deepLink: string;
  sentAt: string;
  audience: "CUSTOMER" | "SELLER";
}

const CATEGORY_MAP: Record<string, NotificationCategory> = {
  ANNOUNCEMENT: "promotions",
  PROMOTION: "promotions",
  OFFER: "offers",
  ORDER: "orders",
  PAYMENT: "payments",
  DOCUMENT: "documents",
  KYC: "documents",
  SYSTEM: "marketplace",
};

const TYPE_MAP: Record<string, NotificationType> = {
  ANNOUNCEMENT: "new_product_launch",
  PROMOTION: "festival_offer",
  OFFER: "offer_available",
  ORDER: "purchase_order_generated",
  PAYMENT: "credit_scheme",
  DOCUMENT: "documents_available",
  KYC: "gst_verified",
  SYSTEM: "new_product_launch",
};

function toPriority(value: string): NotificationPriority {
  if (value === "HIGH") return "high";
  if (value === "LOW") return "low";
  return "medium";
}

export function adminPushToCustomerNotification(item: AdminPushPayload): AppNotification {
  const category = CATEGORY_MAP[item.category] ?? "promotions";
  return {
    id: item.id,
    type: TYPE_MAP[item.category] ?? "new_product_launch",
    category,
    title: item.title,
    description: item.body,
    fullDescription: item.body,
    referenceNumber: item.id,
    status: "unread",
    priority: toPriority(item.priority),
    createdAt: item.sentAt,
    href: item.deepLink || "/dashboard",
  };
}

export async function fetchAdminCustomerPushes(): Promise<AdminPushPayload[]> {
  const response = await fetch(
    `${env.adminApiUrl}/api/push-notifications?audience=customer&status=SENT`,
    { cache: "no-store" },
  );
  if (!response.ok) return [];
  const payload = (await response.json()) as { data?: AdminPushPayload[] };
  return payload.data ?? [];
}

export async function hydrateAdminPushInbox() {
  try {
    const items = await fetchAdminCustomerPushes();
    if (items.length === 0) return 0;
    const mapped = items.map(adminPushToCustomerNotification);
    return useNotificationsCatalogStore.getState().ingestAdminPushes(mapped);
  } catch {
    return 0;
  }
}
