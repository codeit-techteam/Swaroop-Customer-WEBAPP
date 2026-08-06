import { ROUTES, purchaseRequestsFiltered } from "@/constants";
import type {
  AppNotification,
  NotificationAttachment,
  NotificationCategory,
  NotificationPreferences,
  NotificationPriority,
  NotificationStatus,
  NotificationTimelineEvent,
  NotificationType,
  NotificationsFiltersState,
} from "@/types/notifications";

export const DEFAULT_NOTIFICATION_FILTERS: NotificationsFiltersState = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  categoryIn: null,
  time: "all",
  sortBy: "newest",
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  desktop: true,
  email: true,
  sms: false,
  push: true,
  orderAlerts: true,
  shipmentAlerts: true,
  paymentAlerts: true,
  marketingNotifications: false,
  documentNotifications: true,
};

const SELLERS = [
  "PetroTrade Supply Network",
  "West India Hub",
  "East India Hub",
  "North India Hub",
  "Coastal Hub",
] as const;

const WAREHOUSES = [
  "Jamnagar Hub",
  "Hazira Hub",
  "Dahej Hub",
  "Mundra Hub",
] as const;

const PRODUCTS = [
  "PP Raffia",
  "HDPE",
  "LLDPE",
  "PVC Resin",
  "PET Resin",
] as const;

type Seed = {
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  hoursAgo: number;
  sellerIdx?: number;
  warehouseIdx?: number;
  productIdx?: number;
  orderN?: number;
  poN?: number;
  invN?: number;
  payN?: number;
  shpN?: number;
  title?: string;
  description?: string;
  fullDescription?: string;
  href?: string;
  includeTimeline?: boolean;
  includeAttachments?: boolean;
};

function hoursAgoIso(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

function pad(n: number, len = 5): string {
  return String(n).padStart(len, "0");
}

function refFor(type: NotificationType, orderN: number): string {
  const map: Partial<Record<NotificationType, string>> = {
    purchase_request_submitted: `PR-2026-${pad(orderN)}`,
    seller_reviewing_request: `PR-2026-${pad(orderN)}`,
    seller_approved_request: `PR-2026-${pad(orderN)}`,
    seller_rejected_request: `PR-2026-${pad(orderN)}`,
    purchase_request_expired: `PR-2026-${pad(orderN)}`,
    purchase_order_generated: `PT-PO-2026-${pad(orderN)}`,
    purchase_order_ready: `PT-PO-2026-${pad(orderN)}`,
    advance_payment_required: `PAY-2026-${pad(orderN + 500)}`,
    payment_submitted: `PAY-2026-${pad(orderN + 500)}`,
    utr_uploaded: `UTR-2026-${pad(orderN)}`,
    payment_under_verification: `PAY-2026-${pad(orderN + 500)}`,
    payment_approved: `PAY-2026-${pad(orderN + 500)}`,
    payment_failed: `PAY-2026-${pad(orderN + 500)}`,
    payment_received: `PAY-2026-${pad(orderN + 500)}`,
    refund_initiated: `REF-2026-${pad(orderN)}`,
    receipt_ready: `RCP-2026-${pad(orderN)}`,
    shipment_created: `PT-SHP-90${pad(orderN, 3)}`,
    truck_assigned: `PT-SHP-90${pad(orderN, 3)}`,
    vehicle_assigned: `PT-SHP-90${pad(orderN, 3)}`,
    driver_assigned: `PT-SHP-90${pad(orderN, 3)}`,
    vehicle_dispatched: `PT-SHP-90${pad(orderN, 3)}`,
    truck_left_warehouse: `PT-SHP-90${pad(orderN, 3)}`,
    shipment_in_transit: `PT-SHP-90${pad(orderN, 3)}`,
    reached_hub: `PT-SHP-90${pad(orderN, 3)}`,
    reached_destination: `PT-SHP-90${pad(orderN, 3)}`,
    shipment_delayed: `PT-SHP-90${pad(orderN, 3)}`,
    shipment_delivered: `PT-SHP-90${pad(orderN, 3)}`,
    dispatch_scheduled: `PT-ORD-88${pad(orderN, 3)}`,
    shipment_started: `PT-SHP-90${pad(orderN, 3)}`,
    invoice_generated: `INV-2026-${pad(orderN)}`,
    gst_invoice_ready: `GST-INV-2026-${pad(orderN)}`,
    certificates_uploaded: `CERT-2026-${pad(orderN)}`,
    documents_available: `DOC-2026-${pad(orderN)}`,
    quality_certificate_ready: `QC-2026-${pad(orderN)}`,
    lab_report_ready: `LAB-2026-${pad(orderN)}`,
    transport_documents_uploaded: `TD-2026-${pad(orderN)}`,
    offer_available: `OFFER-2026-${pad(orderN)}`,
    flash_sale: `FLASH-2026-${pad(orderN)}`,
    festival_offer: `FEST-2026-${pad(orderN)}`,
    bulk_discount: `BULK-2026-${pad(orderN)}`,
    new_product_launch: `LAUNCH-2026-${pad(orderN)}`,
    credit_scheme: `CREDIT-SCH-2026-${pad(orderN)}`,
    special_warehouse_offer: `WH-OFFER-2026-${pad(orderN)}`,
    limited_time_pricing: `LTP-2026-${pad(orderN)}`,
    credit_activated: `CR-ACT-2026-${pad(orderN)}`,
    credit_limit_increased: `CR-INC-2026-${pad(orderN)}`,
    credit_limit_expiring: `CR-EXP-2026-${pad(orderN)}`,
    system_maintenance: `SYS-MTN-2026-${pad(orderN)}`,
    account_verification: `ACC-VER-2026-${pad(orderN)}`,
    profile_updated: `PRF-UPD-2026-${pad(orderN)}`,
    policy_update: `POL-UPD-2026-${pad(orderN)}`,
    security_alert: `SEC-ALT-2026-${pad(orderN)}`,
    password_changed: `PWD-CHG-2026-${pad(orderN)}`,
    gst_verified: `GST-VER-2026-${pad(orderN)}`,
  };
  return map[type] ?? `NTF-2026-${pad(orderN)}`;
}

function defaultHref(
  category: NotificationCategory,
  orderN: number,
  payN: number,
  shpN: number,
): string {
  switch (category) {
    case "orders":
      return `${ROUTES.orders}/PT-ORD-88${pad(orderN, 3)}`;
    case "purchase_requests":
    case "seller_approval":
      return purchaseRequestsFiltered("active");
    case "payments":
      return `${ROUTES.payments}/PAY-2026-${pad(payN)}`;
    case "shipment":
      return `${ROUTES.shipmentTracking}/PT-SHP-90${pad(shpN, 3)}`;
    case "documents":
      return ROUTES.documents;
    case "promotions":
    case "offers":
    case "marketplace":
      return ROUTES.marketplaceOffers;
    case "system":
      return ROUTES.profile;
    default:
      return ROUTES.dashboard;
  }
}

function defaultCopy(
  type: NotificationType,
  product: string,
  _seller: string,
  warehouse: string,
  orderN: number,
  ref: string,
): { title: string; description: string; fullDescription: string } {
  const order = `PT-ORD-88${pad(orderN, 3)}`;
  const po = `PO-2026-${pad(orderN)}`;
  const titles: Partial<Record<NotificationType, string>> = {
    purchase_request_submitted: "Purchase Request Submitted",
    seller_reviewing_request: "Under Review",
    seller_approved_request: "Order Confirmed",
    seller_rejected_request: "Request Declined",
    purchase_request_expired: "Purchase Request Expired",
    purchase_order_generated: "Purchase Order Generated",
    purchase_order_ready: "Purchase Order Ready",
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
    dispatch_scheduled: "Dispatch Scheduled",
    shipment_started: "Shipment Started",
    invoice_generated: "Invoice Generated",
    gst_invoice_ready: "GST Invoice Ready",
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
  };

  const descriptions: Partial<Record<NotificationType, string>> = {
    purchase_request_submitted: `Your purchase request for ${product} has been submitted successfully to PetroTrade.`,
    seller_reviewing_request: `PetroTrade is reviewing your request for ${product} (${warehouse}).`,
    seller_approved_request: `Order confirmed for ${product}. Order generation is in progress.`,
    seller_rejected_request: `PetroTrade declined the purchase request for ${product} from ${warehouse}.`,
    purchase_request_expired: `Purchase request for ${product} expired before confirmation.`,
    purchase_order_generated: `${po} has been successfully generated after PetroTrade confirmation.`,
    purchase_order_ready: `Purchase order PDF for ${po} is ready to download.`,
    advance_payment_required: `Advance payment is required to proceed with order ${order}.`,
    payment_submitted: `Payment for ${product} order ${order} has been submitted.`,
    utr_uploaded: `UTR proof uploaded for payment against ${order}.`,
    payment_under_verification: `Finance team is verifying your payment for ${order}.`,
    payment_approved: `Payment approved for ${order}. Order processing will continue.`,
    payment_failed: `Payment for ${order} failed verification. Please re-submit proof.`,
    payment_received: `Payment received for ${product} (${order}).`,
    refund_initiated: `Refund initiated for ${order}. Amount will credit within 3–5 business days.`,
    receipt_ready: `Payment receipt for ${order} is ready to download.`,
    credit_activated: `Trade credit has been activated on your PetroTrade account.`,
    shipment_created: `Shipment created for ${product} from ${warehouse}.`,
    truck_assigned: `Truck assigned for ${order} dispatch from ${warehouse}.`,
    vehicle_assigned: `Vehicle assigned for shipment of ${product} (${warehouse}).`,
    driver_assigned: `Driver assigned for ${order} shipment from ${warehouse}.`,
    vehicle_dispatched: `Vehicle dispatched from ${warehouse} with ${product} cargo.`,
    truck_left_warehouse: `Truck left ${warehouse} en route to destination.`,
    shipment_in_transit: `${product} shipment via PetroTrade Logistics is currently in transit.`,
    reached_hub: `Shipment for ${order} reached the transit hub.`,
    reached_destination: `Shipment for ${order} has reached the destination city.`,
    shipment_delayed: `Shipment delayed due to weather near ${warehouse}. ETA updated.`,
    shipment_delivered: `${product} delivered successfully for order ${order}.`,
    dispatch_scheduled: `Dispatch scheduled for ${order} from ${warehouse}.`,
    shipment_started: `Shipment started for ${order}. Track live progress.`,
    invoice_generated: `Tax invoice generated for ${order} (${product}).`,
    gst_invoice_ready: `GST invoice for ${order} is ready for download.`,
    certificates_uploaded: `Quality & material certificates uploaded for ${order}.`,
    documents_available: `Order documents for ${order} are now available in Documents.`,
    quality_certificate_ready: `Quality certificate for ${product} is ready via PetroTrade QC.`,
    lab_report_ready: `Lab test report for ${product} batch is available.`,
    transport_documents_uploaded: `E-way bill and transport docs uploaded for ${order}.`,
    offer_available: `New offer on ${product} available at ${warehouse}.`,
    flash_sale: `Flash sale live on ${product} — limited stock at ${warehouse}.`,
    festival_offer: `Festival pricing active on ${product} at ${warehouse}.`,
    bulk_discount: `Bulk discount unlocked for ${product} orders above 50 MT.`,
    new_product_launch: `New grade of ${product} now available on PetroTrade.`,
    credit_scheme: `Special credit scheme available for ${product} procurement.`,
    special_warehouse_offer: `Exclusive pricing from ${warehouse}.`,
    limited_time_pricing: `Limited-time price lock on ${product} — ends soon.`,
    credit_limit_increased: `Your credit limit has been increased successfully.`,
    credit_limit_expiring: `Your trade credit limit expires in 7 days. Renew soon.`,
    system_maintenance: `Scheduled maintenance on Sunday 02:00–04:00 IST.`,
    account_verification: `Your business account verification is complete.`,
    profile_updated: `Company profile details were updated successfully.`,
    policy_update: `Procurement policy update published. Please review.`,
    security_alert: `New login detected on your PetroTrade account.`,
    password_changed: `Your account password was changed successfully.`,
    gst_verified: `GSTIN verification completed for your company profile.`,
  };

  const title = titles[type] ?? "Notification";
  const description =
    descriptions[type] ??
    `Update regarding ${product} via PetroTrade Supply Network (${ref}).`;
  const fullDescription = `${description}

Reference: ${ref}
Order: ${order}
Product: ${product}
Supply Source: PetroTrade Supply Network
Warehouse: ${warehouse}

This alert is part of your procurement workflow on PetroTrade Customer Portal. Open the related module for full details and next actions.`;

  return { title, description, fullDescription };
}

function buildTimeline(
  type: NotificationType,
  createdAt: string,
): NotificationTimelineEvent[] {
  const base = new Date(createdAt).getTime();
  const step = (
    h: number,
    label: string,
    status: NotificationTimelineEvent["status"],
    desc?: string,
  ) => ({
    id: `${type}-${h}`,
    label,
    description: desc,
    at: new Date(base - h * 3_600_000).toISOString(),
    status,
  });

  if (
    type.startsWith("payment") ||
    type === "utr_uploaded" ||
    type === "advance_payment_required" ||
    type === "receipt_ready" ||
    type === "refund_initiated"
  ) {
    return [
      step(48, "Advance payment requested", "completed"),
      step(24, "Payment submitted", "completed"),
      step(6, "UTR uploaded", "completed"),
      step(0, "Current status", "current", "See notification details"),
    ];
  }

  if (
    type.includes("shipment") ||
    type.includes("truck") ||
    type.includes("vehicle") ||
    type.includes("driver") ||
    type.includes("reached") ||
    type === "dispatch_scheduled"
  ) {
    return [
      step(72, "Shipment created", "completed"),
      step(48, "Vehicle & driver assigned", "completed"),
      step(24, "Dispatched from warehouse", "completed"),
      step(0, "Current status", "current"),
      step(-24, "Delivery", "upcoming"),
    ];
  }

  return [
    step(36, "Request submitted", "completed"),
    step(18, "Order update", "completed"),
    step(0, "Current status", "current"),
  ];
}

function buildAttachments(
  type: NotificationType,
  orderN: number,
): NotificationAttachment[] {
  if (
    type.includes("invoice") ||
    type.includes("certificate") ||
    type.includes("document") ||
    type === "purchase_order_ready" ||
    type === "lab_report_ready" ||
    type === "receipt_ready" ||
    type === "transport_documents_uploaded"
  ) {
    return [
      {
        id: `att-${orderN}-1`,
        name: `${refFor(type, orderN)}.pdf`,
        type: "application/pdf",
        sizeLabel: "248 KB",
        href: ROUTES.documents,
      },
    ];
  }
  return [];
}

const SEEDS: Seed[] = [
  // —— Today (0–18h) ——
  {
    type: "purchase_order_generated",
    category: "orders",
    priority: "high",
    status: "unread",
    hoursAgo: 0.03,
    orderN: 452,
    poN: 452,
    includeTimeline: true,
  },
  {
    type: "advance_payment_required",
    category: "payments",
    priority: "high",
    status: "unread",
    hoursAgo: 0.5,
    orderN: 201,
    payN: 501,
    includeTimeline: true,
  },
  {
    type: "utr_uploaded",
    category: "payments",
    priority: "medium",
    status: "unread",
    hoursAgo: 1,
    orderN: 202,
    payN: 502,
    includeTimeline: true,
  },
  {
    type: "vehicle_dispatched",
    category: "shipment",
    priority: "high",
    status: "unread",
    hoursAgo: 1.5,
    orderN: 203,
    shpN: 1,
    includeTimeline: true,
  },
  {
    type: "gst_invoice_ready",
    category: "documents",
    priority: "medium",
    status: "unread",
    hoursAgo: 2,
    orderN: 204,
    invN: 204,
    includeAttachments: true,
  },
  {
    type: "seller_approved_request",
    category: "seller_approval",
    priority: "high",
    status: "unread",
    hoursAgo: 2.5,
    orderN: 205,
  },
  {
    type: "shipment_in_transit",
    category: "shipment",
    priority: "medium",
    status: "unread",
    hoursAgo: 3,
    orderN: 206,
    shpN: 2,
    includeTimeline: true,
  },
  {
    type: "payment_under_verification",
    category: "payments",
    priority: "medium",
    status: "unread",
    hoursAgo: 3.5,
    orderN: 207,
    payN: 510,
  },
  {
    type: "flash_sale",
    category: "promotions",
    priority: "medium",
    status: "unread",
    hoursAgo: 4,
    orderN: 1,
    productIdx: 0,
  },
  {
    type: "invoice_generated",
    category: "documents",
    priority: "medium",
    status: "read",
    hoursAgo: 5,
    orderN: 208,
    invN: 208,
    includeAttachments: true,
  },
  {
    type: "driver_assigned",
    category: "shipment",
    priority: "low",
    status: "unread",
    hoursAgo: 6,
    orderN: 209,
    shpN: 3,
  },
  {
    type: "purchase_request_submitted",
    category: "purchase_requests",
    priority: "medium",
    status: "unread",
    hoursAgo: 7,
    orderN: 210,
  },
  {
    type: "payment_approved",
    category: "payments",
    priority: "completed",
    status: "read",
    hoursAgo: 8,
    orderN: 211,
    payN: 511,
  },
  {
    type: "credit_limit_increased",
    category: "system",
    priority: "high",
    status: "unread",
    hoursAgo: 9,
    orderN: 2,
  },
  {
    type: "documents_available",
    category: "documents",
    priority: "low",
    status: "unread",
    hoursAgo: 10,
    orderN: 212,
    includeAttachments: true,
  },
  {
    type: "seller_reviewing_request",
    category: "seller_approval",
    priority: "medium",
    status: "unread",
    hoursAgo: 11,
    orderN: 213,
  },
  {
    type: "truck_assigned",
    category: "shipment",
    priority: "medium",
    status: "read",
    hoursAgo: 12,
    orderN: 214,
    shpN: 4,
  },
  {
    type: "festival_offer",
    category: "offers",
    priority: "low",
    status: "unread",
    hoursAgo: 14,
    orderN: 3,
    productIdx: 1,
  },
  {
    type: "shipment_created",
    category: "shipment",
    priority: "medium",
    status: "read",
    hoursAgo: 16,
    orderN: 215,
    shpN: 5,
  },
  {
    type: "profile_updated",
    category: "system",
    priority: "low",
    status: "read",
    hoursAgo: 18,
    orderN: 4,
  },

  // —— Yesterday (24–42h) ——
  {
    type: "shipment_delivered",
    category: "shipment",
    priority: "completed",
    status: "read",
    hoursAgo: 25,
    orderN: 216,
    shpN: 6,
    includeTimeline: true,
  },
  {
    type: "payment_submitted",
    category: "payments",
    priority: "medium",
    status: "read",
    hoursAgo: 26,
    orderN: 217,
    payN: 514,
  },
  {
    type: "seller_rejected_request",
    category: "seller_approval",
    priority: "high",
    status: "read",
    hoursAgo: 27,
    orderN: 218,
  },
  {
    type: "quality_certificate_ready",
    category: "documents",
    priority: "medium",
    status: "unread",
    hoursAgo: 28,
    orderN: 219,
    includeAttachments: true,
  },
  {
    type: "dispatch_scheduled",
    category: "orders",
    priority: "medium",
    status: "read",
    hoursAgo: 29,
    orderN: 220,
  },
  {
    type: "bulk_discount",
    category: "promotions",
    priority: "low",
    status: "read",
    hoursAgo: 30,
    orderN: 5,
    productIdx: 2,
  },
  {
    type: "payment_failed",
    category: "payments",
    priority: "high",
    status: "unread",
    hoursAgo: 31,
    orderN: 221,
    payN: 516,
  },
  {
    type: "reached_hub",
    category: "shipment",
    priority: "medium",
    status: "read",
    hoursAgo: 32,
    orderN: 222,
    shpN: 7,
  },
  {
    type: "purchase_order_ready",
    category: "documents",
    priority: "medium",
    status: "read",
    hoursAgo: 33,
    orderN: 223,
    includeAttachments: true,
  },
  {
    type: "gst_verified",
    category: "system",
    priority: "completed",
    status: "read",
    hoursAgo: 34,
    orderN: 6,
  },
  {
    type: "credit_activated",
    category: "system",
    priority: "high",
    status: "read",
    hoursAgo: 35,
    orderN: 7,
  },
  {
    type: "lab_report_ready",
    category: "documents",
    priority: "low",
    status: "unread",
    hoursAgo: 36,
    orderN: 224,
    includeAttachments: true,
  },
  {
    type: "vehicle_assigned",
    category: "shipment",
    priority: "low",
    status: "read",
    hoursAgo: 37,
    orderN: 225,
    shpN: 8,
  },
  {
    type: "receipt_ready",
    category: "payments",
    priority: "completed",
    status: "read",
    hoursAgo: 38,
    orderN: 226,
    payN: 517,
    includeAttachments: true,
  },
  {
    type: "special_warehouse_offer",
    category: "marketplace",
    priority: "medium",
    status: "unread",
    hoursAgo: 40,
    orderN: 8,
    warehouseIdx: 2,
  },
  {
    type: "shipment_delayed",
    category: "shipment",
    priority: "high",
    status: "unread",
    hoursAgo: 42,
    orderN: 227,
    shpN: 9,
    includeTimeline: true,
  },

  // —— Last week (3–7 days) ——
  {
    type: "purchase_request_expired",
    category: "purchase_requests",
    priority: "medium",
    status: "read",
    hoursAgo: 50,
    orderN: 228,
  },
  {
    type: "payment_received",
    category: "payments",
    priority: "completed",
    status: "read",
    hoursAgo: 55,
    orderN: 229,
    payN: 518,
  },
  {
    type: "truck_left_warehouse",
    category: "shipment",
    priority: "medium",
    status: "read",
    hoursAgo: 60,
    orderN: 230,
    shpN: 1,
  },
  {
    type: "certificates_uploaded",
    category: "documents",
    priority: "low",
    status: "read",
    hoursAgo: 65,
    orderN: 231,
    includeAttachments: true,
  },
  {
    type: "new_product_launch",
    category: "promotions",
    priority: "low",
    status: "read",
    hoursAgo: 70,
    orderN: 9,
    productIdx: 3,
  },
  {
    type: "reached_destination",
    category: "shipment",
    priority: "completed",
    status: "read",
    hoursAgo: 75,
    orderN: 232,
    shpN: 2,
  },
  {
    type: "refund_initiated",
    category: "payments",
    priority: "high",
    status: "read",
    hoursAgo: 80,
    orderN: 233,
    payN: 520,
  },
  {
    type: "transport_documents_uploaded",
    category: "documents",
    priority: "medium",
    status: "read",
    hoursAgo: 85,
    orderN: 234,
    includeAttachments: true,
  },
  {
    type: "credit_scheme",
    category: "offers",
    priority: "medium",
    status: "read",
    hoursAgo: 90,
    orderN: 10,
  },
  {
    type: "security_alert",
    category: "system",
    priority: "high",
    status: "read",
    hoursAgo: 95,
    orderN: 11,
  },
  {
    type: "shipment_started",
    category: "orders",
    priority: "medium",
    status: "read",
    hoursAgo: 100,
    orderN: 235,
    shpN: 3,
  },
  {
    type: "limited_time_pricing",
    category: "promotions",
    priority: "medium",
    status: "unread",
    hoursAgo: 105,
    orderN: 12,
    productIdx: 4,
  },
  {
    type: "password_changed",
    category: "system",
    priority: "medium",
    status: "read",
    hoursAgo: 110,
    orderN: 13,
  },
  {
    type: "offer_available",
    category: "offers",
    priority: "low",
    status: "read",
    hoursAgo: 120,
    orderN: 14,
    productIdx: 0,
  },
  {
    type: "purchase_order_generated",
    category: "orders",
    priority: "high",
    status: "read",
    hoursAgo: 130,
    orderN: 236,
    poN: 236,
  },
  {
    type: "payment_approved",
    category: "payments",
    priority: "completed",
    status: "read",
    hoursAgo: 140,
    orderN: 237,
    payN: 521,
  },
  {
    type: "shipment_delivered",
    category: "shipment",
    priority: "completed",
    status: "read",
    hoursAgo: 150,
    orderN: 238,
    shpN: 4,
  },
  {
    type: "invoice_generated",
    category: "documents",
    priority: "medium",
    status: "read",
    hoursAgo: 155,
    orderN: 239,
    invN: 239,
  },
  {
    type: "seller_approved_request",
    category: "seller_approval",
    priority: "high",
    status: "read",
    hoursAgo: 160,
    orderN: 240,
  },
  {
    type: "account_verification",
    category: "system",
    priority: "completed",
    status: "read",
    hoursAgo: 165,
    orderN: 15,
  },

  // —— Older (8–30 days) ——
  {
    type: "system_maintenance",
    category: "system",
    priority: "medium",
    status: "read",
    hoursAgo: 200,
    orderN: 16,
  },
  {
    type: "credit_limit_expiring",
    category: "system",
    priority: "high",
    status: "unread",
    hoursAgo: 220,
    orderN: 17,
  },
  {
    type: "policy_update",
    category: "system",
    priority: "low",
    status: "read",
    hoursAgo: 240,
    orderN: 18,
  },
  {
    type: "gst_invoice_ready",
    category: "documents",
    priority: "medium",
    status: "read",
    hoursAgo: 260,
    orderN: 241,
    invN: 241,
    includeAttachments: true,
  },
  {
    type: "purchase_request_submitted",
    category: "purchase_requests",
    priority: "low",
    status: "read",
    hoursAgo: 280,
    orderN: 242,
  },
  {
    type: "seller_reviewing_request",
    category: "seller_approval",
    priority: "medium",
    status: "read",
    hoursAgo: 300,
    orderN: 243,
  },
  {
    type: "advance_payment_required",
    category: "payments",
    priority: "high",
    status: "read",
    hoursAgo: 320,
    orderN: 244,
    payN: 533,
  },
  {
    type: "utr_uploaded",
    category: "payments",
    priority: "medium",
    status: "read",
    hoursAgo: 340,
    orderN: 245,
    payN: 534,
  },
  {
    type: "vehicle_dispatched",
    category: "shipment",
    priority: "medium",
    status: "read",
    hoursAgo: 360,
    orderN: 246,
    shpN: 5,
  },
  {
    type: "shipment_in_transit",
    category: "shipment",
    priority: "low",
    status: "read",
    hoursAgo: 380,
    orderN: 247,
    shpN: 6,
  },
  {
    type: "festival_offer",
    category: "promotions",
    priority: "low",
    status: "archived",
    hoursAgo: 400,
    orderN: 19,
  },
  {
    type: "flash_sale",
    category: "offers",
    priority: "medium",
    status: "read",
    hoursAgo: 420,
    orderN: 20,
    productIdx: 1,
  },
  {
    type: "documents_available",
    category: "documents",
    priority: "low",
    status: "read",
    hoursAgo: 440,
    orderN: 248,
  },
  {
    type: "shipment_delivered",
    category: "shipment",
    priority: "completed",
    status: "read",
    hoursAgo: 460,
    orderN: 249,
    shpN: 7,
  },
  {
    type: "payment_failed",
    category: "payments",
    priority: "high",
    status: "archived",
    hoursAgo: 480,
    orderN: 250,
    payN: 535,
  },
  {
    type: "new_product_launch",
    category: "marketplace",
    priority: "low",
    status: "read",
    hoursAgo: 500,
    orderN: 21,
  },
  {
    type: "truck_assigned",
    category: "shipment",
    priority: "low",
    status: "read",
    hoursAgo: 520,
    orderN: 251,
    shpN: 8,
  },
  {
    type: "purchase_order_generated",
    category: "orders",
    priority: "completed",
    status: "read",
    hoursAgo: 540,
    orderN: 252,
  },
  {
    type: "credit_activated",
    category: "system",
    priority: "completed",
    status: "read",
    hoursAgo: 560,
    orderN: 22,
  },
  {
    type: "quality_certificate_ready",
    category: "documents",
    priority: "medium",
    status: "read",
    hoursAgo: 580,
    orderN: 253,
  },
  {
    type: "seller_rejected_request",
    category: "seller_approval",
    priority: "medium",
    status: "archived",
    hoursAgo: 600,
    orderN: 254,
  },
  {
    type: "receipt_ready",
    category: "payments",
    priority: "completed",
    status: "read",
    hoursAgo: 620,
    orderN: 255,
    payN: 536,
  },
  {
    type: "bulk_discount",
    category: "promotions",
    priority: "low",
    status: "read",
    hoursAgo: 640,
    orderN: 23,
  },
  {
    type: "dispatch_scheduled",
    category: "orders",
    priority: "medium",
    status: "read",
    hoursAgo: 660,
    orderN: 256,
  },
  {
    type: "reached_hub",
    category: "shipment",
    priority: "low",
    status: "read",
    hoursAgo: 680,
    orderN: 257,
    shpN: 9,
  },
  {
    type: "gst_invoice_ready",
    category: "documents",
    priority: "completed",
    status: "read",
    hoursAgo: 700,
    orderN: 258,
  },
  {
    type: "security_alert",
    category: "system",
    priority: "high",
    status: "read",
    hoursAgo: 720,
    orderN: 24,
  },
];

function buildFromSeed(seed: Seed, index: number): AppNotification {
  const sellerIdx = seed.sellerIdx ?? index % SELLERS.length;
  const warehouseIdx = seed.warehouseIdx ?? index % WAREHOUSES.length;
  const productIdx = seed.productIdx ?? index % PRODUCTS.length;
  const orderN = seed.orderN ?? 200 + index;
  const payN = seed.payN ?? orderN + 500;
  const shpN = seed.shpN ?? (index % 9) + 1;
  const seller = SELLERS[sellerIdx];
  const warehouse = WAREHOUSES[warehouseIdx];
  const product = PRODUCTS[productIdx];
  const createdAt = hoursAgoIso(seed.hoursAgo);
  const referenceNumber = refFor(seed.type, orderN);
  const copy = defaultCopy(
    seed.type,
    product,
    seller,
    warehouse,
    orderN,
    referenceNumber,
  );
  const orderNumber = `PT-ORD-88${pad(orderN, 3)}`;
  const poNumber = `PO-2026-${pad(orderN)}`;
  const invoiceNumber = `INV-2026-${pad(orderN)}`;

  let href =
    seed.href ??
    defaultHref(
      seed.category,
      Math.min(orderN % 13 || 1, 13) + 200,
      payN,
      shpN,
    );

  // Point to known catalog IDs where possible
  if (seed.category === "orders") {
    const known = [
      "88201",
      "88202",
      "88203",
      "88204",
      "88205",
      "88206",
      "88207",
      "88208",
      "88209",
      "88210",
      "88211",
      "88212",
      "88213",
    ];
    const id = known[index % known.length];
    href = `${ROUTES.orders}/PT-ORD-${id}`;
  } else if (seed.category === "payments") {
    const knownPay = ["0501", "0510", "0514", "0516", "0517", "0518", "0533"];
    href = `${ROUTES.payments}/PAY-2026-${knownPay[index % knownPay.length]}`;
  } else if (seed.category === "shipment") {
    const knownShp = [
      "90001",
      "90002",
      "90003",
      "90004",
      "90005",
      "90006",
      "90007",
      "90008",
      "90009",
    ];
    href = `${ROUTES.shipmentTracking}/PT-SHP-${knownShp[index % knownShp.length]}`;
  } else if (seed.category === "documents") {
    if (seed.type === "gst_invoice_ready") href = ROUTES.documentsGstInvoices;
    else if (seed.type === "invoice_generated") href = ROUTES.documentsInvoices;
    else if (
      seed.type.includes("certificate") ||
      seed.type === "lab_report_ready"
    )
      href = ROUTES.documentsCertificates;
    else if (seed.type === "purchase_order_ready") href = ROUTES.documents;
    else href = ROUTES.documents;
  } else if (
    seed.category === "purchase_requests" ||
    seed.category === "seller_approval"
  ) {
    if (seed.type === "seller_approved_request")
      href = purchaseRequestsFiltered("approved");
    else if (seed.type === "seller_rejected_request")
      href = purchaseRequestsFiltered("rejected");
    else if (seed.type === "purchase_request_expired")
      href = purchaseRequestsFiltered("expired");
    else if (seed.type === "seller_reviewing_request")
      href = purchaseRequestsFiltered("pending");
    else href = purchaseRequestsFiltered("active");
  } else if (
    seed.category === "promotions" ||
    seed.category === "offers" ||
    seed.category === "marketplace"
  ) {
    href = ROUTES.marketplaceOffers;
  } else if (seed.category === "system") {
    if (seed.type === "profile_updated" || seed.type === "gst_verified")
      href = ROUTES.profileCompany;
    else if (seed.type === "password_changed" || seed.type === "security_alert")
      href = ROUTES.settings;
    else href = ROUTES.profile;
  }

  return {
    id: `ntf-${pad(index + 1, 3)}`,
    type: seed.type,
    category: seed.category,
    title: seed.title ?? copy.title,
    description: seed.description ?? copy.description,
    fullDescription: seed.fullDescription ?? copy.fullDescription,
    referenceNumber,
    status: seed.status,
    priority: seed.priority,
    createdAt,
    href,
    relatedOrder: orderNumber,
    relatedProduct: product,
    seller,
    warehouse,
    orderNumber,
    poNumber,
    invoiceNumber,
    productName: product,
    paymentId:
      seed.category === "payments" ? `PAY-2026-${pad(payN)}` : undefined,
    shipmentId:
      seed.category === "shipment" ? `PT-SHP-90${pad(shpN, 3)}` : undefined,
    timeline: seed.includeTimeline
      ? buildTimeline(seed.type, createdAt)
      : buildTimeline(seed.type, createdAt).slice(0, 3),
    attachments: seed.includeAttachments
      ? buildAttachments(seed.type, orderN)
      : undefined,
  };
}

export const notificationsCatalogMock: AppNotification[] = SEEDS.map(
  (seed, i) => buildFromSeed(seed, i),
);

/** Ensure ≥80 notifications — pad with varied lifecycle events if needed */
while (notificationsCatalogMock.length < 82) {
  const i = notificationsCatalogMock.length;
  const extraTypes: NotificationType[] = [
    "purchase_request_submitted",
    "seller_approved_request",
    "purchase_order_generated",
    "advance_payment_required",
    "payment_approved",
    "shipment_created",
    "vehicle_dispatched",
    "shipment_delivered",
    "invoice_generated",
    "gst_invoice_ready",
    "offer_available",
    "system_maintenance",
  ];
  const cats: NotificationCategory[] = [
    "purchase_requests",
    "seller_approval",
    "orders",
    "payments",
    "payments",
    "shipment",
    "shipment",
    "shipment",
    "documents",
    "documents",
    "promotions",
    "system",
  ];
  const idx = i % extraTypes.length;
  notificationsCatalogMock.push(
    buildFromSeed(
      {
        type: extraTypes[idx],
        category: cats[idx],
        priority: (["high", "medium", "low", "completed"] as const)[i % 4],
        status: i % 3 === 0 ? "unread" : "read",
        hoursAgo: 48 + i * 6,
        orderN: 300 + i,
      },
      i,
    ),
  );
}
