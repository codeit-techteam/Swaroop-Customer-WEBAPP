/**
 * Notifications module — MVP header-bell drawer for the Customer Portal.
 * Frontend-only types mirroring the order-to-delivery lifecycle.
 */

export type NotificationStatus = "unread" | "read" | "archived" | "deleted";

export type NotificationPriority = "high" | "medium" | "low" | "completed";

/** CTA actions supported by the MVP notification drawer. */
export type NotificationActionType =
  | "viewOrder"
  | "trackShipment"
  | "viewPayment"
  | "downloadInvoice"
  | "viewOffer"
  | "viewDocument"
  | "openSupportTicket";

export type NotificationCategory =
  | "orders"
  | "purchase_requests"
  | "seller_approval"
  | "payments"
  | "shipment"
  | "documents"
  | "promotions"
  | "offers"
  | "marketplace"
  | "system";

export type NotificationType =
  | "purchase_request_submitted"
  | "seller_reviewing_request"
  | "seller_approved_request"
  | "seller_rejected_request"
  | "purchase_request_expired"
  | "purchase_order_generated"
  | "advance_payment_required"
  | "payment_submitted"
  | "utr_uploaded"
  | "payment_under_verification"
  | "payment_approved"
  | "payment_failed"
  | "payment_received"
  | "refund_initiated"
  | "receipt_ready"
  | "credit_activated"
  | "shipment_created"
  | "truck_assigned"
  | "vehicle_assigned"
  | "driver_assigned"
  | "vehicle_dispatched"
  | "truck_left_warehouse"
  | "shipment_in_transit"
  | "reached_hub"
  | "reached_destination"
  | "shipment_delayed"
  | "shipment_delivered"
  | "invoice_generated"
  | "gst_invoice_ready"
  | "purchase_order_ready"
  | "certificates_uploaded"
  | "documents_available"
  | "quality_certificate_ready"
  | "lab_report_ready"
  | "transport_documents_uploaded"
  | "offer_available"
  | "flash_sale"
  | "festival_offer"
  | "bulk_discount"
  | "new_product_launch"
  | "credit_scheme"
  | "special_warehouse_offer"
  | "limited_time_pricing"
  | "credit_limit_increased"
  | "credit_limit_expiring"
  | "system_maintenance"
  | "account_verification"
  | "profile_updated"
  | "policy_update"
  | "security_alert"
  | "password_changed"
  | "gst_verified"
  | "dispatch_scheduled"
  | "shipment_started";

export type NotificationTimeFilter =
  "all" | "today" | "yesterday" | "last_7_days" | "last_month";

export type NotificationSortBy =
  "newest" | "oldest" | "priority_high" | "priority_low" | "unread_first";

export type NotificationViewFilter =
  | "all"
  | "unread"
  | "orders"
  | "purchase_requests"
  | "seller_approval"
  | "payments"
  | "shipment"
  | "documents"
  | "promotions"
  | "offers"
  | "system";

export interface NotificationTimelineEvent {
  id: string;
  label: string;
  description?: string;
  at: string;
  status: "completed" | "current" | "upcoming";
}

export interface NotificationAttachment {
  id: string;
  name: string;
  type: string;
  sizeLabel: string;
  href?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  description: string;
  fullDescription: string;
  referenceNumber: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  createdAt: string;
  href: string;
  relatedOrder?: string;
  relatedProduct?: string;
  seller?: string;
  warehouse?: string;
  orderNumber?: string;
  poNumber?: string;
  invoiceNumber?: string;
  productName?: string;
  paymentId?: string;
  shipmentId?: string;
  timeline?: NotificationTimelineEvent[];
  attachments?: NotificationAttachment[];
}

export interface NotificationsDashboardSummary {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  priorityAlerts: number;
}

export interface NotificationsFiltersState {
  search: string;
  status: "all" | "unread" | "read";
  priority: "all" | NotificationPriority;
  category: "all" | NotificationCategory;
  /** When set, matches any of these categories (sidebar views like Promotions). */
  categoryIn: NotificationCategory[] | null;
  time: NotificationTimeFilter;
  sortBy: NotificationSortBy;
}

export interface NotificationPreferences {
  desktop: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
  orderAlerts: boolean;
  shipmentAlerts: boolean;
  paymentAlerts: boolean;
  marketingNotifications: boolean;
  documentNotifications: boolean;
}

export interface NotificationDateGroup {
  key: "today" | "yesterday" | "last_week" | "older";
  label: string;
  items: AppNotification[];
}
