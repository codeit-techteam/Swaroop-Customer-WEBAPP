import type { NavItem } from "@/types";

export const APP_NAME = "PetroTrade Customer Portal";
export const APP_SHORT_NAME = "PetroTrade";

export const ROUTES = {
  home: "/",
  auth: "/auth",
  login: "/login",
  register: "/register",
  otpVerification: "/otp-verification",
  forgotPassword: "/forgot-password",
  forgotPasswordOtp: "/forgot-password/otp",
  resetPassword: "/reset-password",
  passwordResetSuccess: "/password-reset-success",

  dashboard: "/dashboard",

  marketplace: "/marketplace",
  marketplaceCategories: "/marketplace/categories",
  marketplaceCategory: "/marketplace/category",
  marketplaceProduct: "/marketplace/product",
  marketplaceOffers: "/marketplace/offers",
  marketplaceMyOffers: "/marketplace/offers/my-offers",
  marketplaceOfferDetail: "/marketplace/offers",
  product: "/product",
  cart: "/cart",
  checkout: "/checkout",

  purchaseRequests: "/purchase-requests",
  purchaseRequestsCreate: "/purchase-requests/create",
  purchaseRequestsReview: "/purchase-requests/review",
  purchaseRequestsPayment: "/purchase-requests/payment",
  purchaseRequestsSubmit: "/purchase-requests/submit",
  purchaseRequestsSubmitted: "/purchase-requests/submitted",
  purchaseRequestsSuccess: "/purchase-requests/success",
  purchaseRequestsActive: "/purchase-requests/active",
  purchaseRequestsPending: "/purchase-requests/pending-approval",
  purchaseRequestsPendingShort: "/purchase-requests/pending",
  purchaseRequestsPendingLive: "/purchase-requests/pending-approval/live",
  purchaseRequestsApproved: "/purchase-requests/approved",
  purchaseRequestsApprovedConfirmation:
    "/purchase-requests/approved/confirmation",
  purchaseRequestsRejected: "/purchase-requests/rejected",
  purchaseRequestsExpired: "/purchase-requests/expired",
  purchaseRequestsHistory: "/purchase-requests/history",

  orders: "/orders",
  orderDetail: "/orders",
  ordersActive: "/orders/active",
  ordersProcessing: "/orders/processing",
  ordersReadyForDispatch: "/orders/ready-for-dispatch",
  ordersInTransit: "/orders/in-transit",
  ordersDelivered: "/orders/delivered",
  ordersCancelled: "/orders/cancelled",
  ordersReorder: "/orders/reorder",

  payments: "/payments",
  paymentDetail: "/payments",
  paymentsRequestCredit: "/payments/request-credit",
  paymentsAdvance: "/payments/advance",
  paymentsOnLoading: "/payments/on-loading",
  paymentsOnDelivery: "/payments/on-delivery",
  paymentsCredit15: "/payments/credit-15-days",
  paymentsCredit30: "/payments/credit-30-days",
  paymentsHistory: "/payments/history",
  /** @deprecated Invoices live under Documents. `/payments/invoices` redirects there. */
  paymentsInvoices: "/documents/invoices",
  paymentsReceipts: "/payments/receipts",

  dispatchDetail: "/dispatch",
  shipmentDetail: "/shipment",

  shipmentTracking: "/shipment-tracking",
  shipmentTransportDocuments: "/shipment-tracking/transport-documents",
  /** Per-shipment details under Track Shipment */
  shipmentTrackingDetail: "/shipment-tracking",

  documents: "/documents",
  documentsPurchaseOrders: "/documents/purchase-orders",
  documentsInvoices: "/documents/invoices",
  documentsProforma: "/documents/proforma-invoice",
  /** @deprecated GST invoices were merged into tax invoices. */
  documentsGstInvoices: "/documents/invoices",
  documentsCertificates: "/documents/certificates",

  profile: "/profile",
  /** @deprecated MVP uses /profile only — kept for legacy deep links */
  profileCompany: "/profile",
  profileGst: "/profile",
  profilePan: "/profile",
  profileAddresses: "/profile#addresses",
  profileBusiness: "/profile",
  profileBank: "/profile",
  settings: "/profile",

  support: "/support",
  supportTickets: "/support/tickets",
  supportLiveChat: "/support/live-chat",
  supportAccountManager: "/support/account-manager",
  supportDocumentation: "/support/documentation",
  supportKnowledgeBase: "/support/knowledge-base",
  supportSettings: "/support/settings",

  onboarding: "/customer/onboarding",
  onboardingCompany: "/customer/onboarding/company-information",
  onboardingGst: "/customer/onboarding/gst-verification",
  onboardingBusinessAddress: "/customer/onboarding/business-address",
  onboardingShipping: "/customer/onboarding/shipping-address",
  onboardingCredit: "/customer/onboarding/credit-eligibility",
  onboardingCompletion: "/customer/onboarding/completion",
} as const;

/** Purchase Requests list with optional status category filter. */
export function purchaseRequestsFiltered(
  status?: "active" | "pending" | "approved" | "rejected" | "expired",
): string {
  if (!status) return ROUTES.purchaseRequests;
  return `${ROUTES.purchaseRequests}?status=${status}`;
}

export const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.otpVerification,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.passwordResetSuccess,
  ROUTES.auth,
] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.marketplace,
  ROUTES.product,
  ROUTES.cart,
  ROUTES.checkout,
  ROUTES.purchaseRequests,
  ROUTES.payments,
  ROUTES.orders,
  ROUTES.shipmentTracking,
  ROUTES.dispatchDetail,
  ROUTES.shipmentDetail,
  ROUTES.documents,
  ROUTES.profile,
  ROUTES.support,
  ROUTES.onboarding,
] as const;

/**
 * Customer App sidebar — mirrors PetroTrade Customer Mobile workflow.
 * Mock badge counts only; no backend.
 */
export const CUSTOMER_NAV: NavItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: ROUTES.dashboard,
    icon: "LayoutDashboard",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    href: ROUTES.marketplace,
    icon: "Store",
    children: [
      {
        id: "marketplace-browse",
        title: "Browse Grades",
        href: ROUTES.marketplace,
      },
    ],
  },
  {
    id: "purchase-requests",
    title: "Purchase Requests",
    href: ROUTES.purchaseRequests,
    icon: "Mail",
    badge: 6,
    badgeVariant: "pending",
  },
  {
    id: "orders",
    title: "Orders",
    href: ROUTES.orders,
    icon: "Package",
    badge: 5,
    badgeVariant: "processing",
  },
  {
    id: "payments",
    title: "Payments",
    href: ROUTES.payments,
    icon: "Wallet",
    badge: 2,
    badgeVariant: "pending",
    children: [
      {
        id: "pay-request-credit",
        title: "Request Credit",
        href: ROUTES.paymentsRequestCredit,
      },
      {
        id: "pay-history",
        title: "Payment History",
        href: ROUTES.paymentsHistory,
      },
      {
        id: "pay-receipts",
        title: "Receipts",
        href: ROUTES.paymentsReceipts,
      },
    ],
  },
  {
    id: "shipment-tracking",
    title: "Shipment Tracking",
    href: ROUTES.shipmentTracking,
    icon: "Truck",
    badge: 2,
    badgeVariant: "dispatched",
    children: [
      {
        id: "ship-track",
        title: "Track Shipment",
        href: ROUTES.shipmentTracking,
      },
      {
        id: "ship-docs",
        title: "Transport Documents",
        href: ROUTES.shipmentTransportDocuments,
      },
    ],
  },
  {
    id: "documents",
    title: "Documents",
    href: ROUTES.documents,
    icon: "FileText",
    children: [
      {
        id: "docs-po",
        title: "Purchase Orders",
        href: ROUTES.documents,
      },
      {
        id: "docs-invoices",
        title: "Tax Invoices",
        href: ROUTES.documentsInvoices,
      },
      {
        id: "docs-proforma",
        title: "Proforma Invoice",
        href: ROUTES.documentsProforma,
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    href: ROUTES.support,
    icon: "LifeBuoy",
  },
  {
    id: "logout",
    title: "Logout",
    icon: "LogOut",
    action: "logout",
  },
];

export const PAGE_SIZES = [10, 20, 50, 100] as const;

export const DEFAULT_PAGE_SIZE = 10;

export {
  paymentsAdvancePayPath,
  paymentsAdvanceUploadPath,
  paymentsAdvanceSuccessPath,
  paymentsAdvanceTrackerPath,
  paymentsAdvanceVerifiedPath,
  paymentsDetailPath,
  PAYMENT_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
} from "./payments";

export {
  documentsPoPath,
  documentsInvoicePath,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  formatFileSize,
} from "./documents";

export {
  NOTIFICATION_STATUS_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_TYPE_LABELS,
  VIEW_FILTER_TO_CATEGORY,
  PRIORITY_COLORS,
} from "./notifications";

export {
  PROFILE_DOCUMENT_LABELS,
  CONTACT_ROLE_LABELS,
  MEMBERSHIP_LABELS,
} from "./profile";

export {
  SUPPORT_ROUTES,
  SUPPORT_CONTACT,
  MVP_TICKET_CATEGORY_OPTIONS,
  TICKET_CATEGORY_LABELS,
  ALLOWED_ATTACHMENT_ACCEPT,
  getMvpStatus,
  MVP_STATUS_LABELS,
  MVP_STATUS_CLASS,
} from "./support";
