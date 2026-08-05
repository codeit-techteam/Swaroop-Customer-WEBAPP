import type {
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
  NotificationViewFilter,
} from "@/types/notifications";

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  unread: "Unread",
  read: "Read",
  archived: "Archived",
  deleted: "Deleted",
};

export const NOTIFICATION_PRIORITY_LABELS: Record<
  NotificationPriority,
  string
> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  completed: "Completed",
};

export const NOTIFICATION_CATEGORY_LABELS: Record<
  NotificationCategory,
  string
> = {
  orders: "Orders",
  purchase_requests: "Purchase Requests",
  seller_approval: "Order Confirmation",
  payments: "Payments",
  shipment: "Shipment",
  documents: "Documents",
  promotions: "Promotions",
  offers: "Offers",
  marketplace: "Marketplace",
  system: "System",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  purchase_request_submitted: "Purchase Request Submitted",
  seller_reviewing_request: "Under Review",
  seller_approved_request: "Order Confirmed",
  seller_rejected_request: "Request Declined",
  purchase_request_expired: "Purchase Request Expired",
  purchase_order_generated: "Purchase Order Generated",
  advance_payment_required: "Advance Payment Required",
  payment_submitted: "Payment Submitted",
  utr_uploaded: "UTR Uploaded",
  payment_under_verification: "Payment Under Verification",
  payment_approved: "Payment Approved",
  payment_failed: "Payment Failed",
  payment_received: "Payment Received",
  refund_initiated: "Refund Initiated",
  receipt_ready: "Receipt Ready",
  credit_activated: "Credit Activated",
  shipment_created: "Shipment Created",
  truck_assigned: "Truck Assigned",
  vehicle_assigned: "Vehicle Assigned",
  driver_assigned: "Driver Assigned",
  vehicle_dispatched: "Vehicle Dispatched",
  truck_left_warehouse: "Truck Left Warehouse",
  shipment_in_transit: "Shipment In Transit",
  reached_hub: "Reached Hub",
  reached_destination: "Reached Destination",
  shipment_delayed: "Shipment Delayed",
  shipment_delivered: "Shipment Delivered Successfully",
  invoice_generated: "Invoice Generated",
  gst_invoice_ready: "GST Invoice Ready",
  purchase_order_ready: "Purchase Order Ready",
  certificates_uploaded: "Certificates Uploaded",
  documents_available: "Documents Available",
  quality_certificate_ready: "Quality Certificate Ready",
  lab_report_ready: "Lab Report Ready",
  transport_documents_uploaded: "Transport Documents Uploaded",
  offer_available: "Offer Available",
  flash_sale: "Flash Sale",
  festival_offer: "Festival Offer",
  bulk_discount: "Bulk Discount",
  new_product_launch: "New Product Launch",
  credit_scheme: "Credit Scheme",
  special_warehouse_offer: "Special Warehouse Offer",
  limited_time_pricing: "Limited Time Pricing",
  credit_limit_increased: "Credit Limit Increased",
  credit_limit_expiring: "Credit Limit Expiring",
  system_maintenance: "System Maintenance",
  account_verification: "Account Verification",
  profile_updated: "Profile Updated",
  policy_update: "Policy Update",
  security_alert: "Security Alert",
  password_changed: "Password Changed",
  gst_verified: "GST Verified",
  dispatch_scheduled: "Dispatch Scheduled",
  shipment_started: "Shipment Started",
};

/** @deprecated View filters removed in MVP — kept for store compatibility. */
export const VIEW_FILTER_TO_CATEGORY: Record<
  Exclude<NotificationViewFilter, "all" | "unread">,
  NotificationCategory | NotificationCategory[]
> = {
  orders: "orders",
  purchase_requests: "purchase_requests",
  seller_approval: "seller_approval",
  payments: "payments",
  shipment: "shipment",
  documents: "documents",
  promotions: ["promotions", "offers", "marketplace"],
  offers: ["offers", "promotions"],
  system: "system",
};

export const PRIORITY_COLORS: Record<
  NotificationPriority,
  { bg: string; text: string; border: string; dot: string }
> = {
  high: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  medium: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
  },
  low: {
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-500",
  },
  completed: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
};
