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
  paymentsAdvance: "/payments/advance",
  paymentsOnLoading: "/payments/on-loading",
  paymentsOnDelivery: "/payments/on-delivery",
  paymentsCredit15: "/payments/credit-15-days",
  paymentsCredit30: "/payments/credit-30-days",
  paymentsHistory: "/payments/history",
  paymentsInvoices: "/payments/invoices",
  paymentsReceipts: "/payments/receipts",

  dispatchDetail: "/dispatch",
  shipmentDetail: "/shipment",

  shipmentTracking: "/shipment-tracking",
  shipmentTimeline: "/shipment-tracking/timeline",
  shipmentDeliveryUpdates: "/shipment-tracking/delivery-updates",
  shipmentTransportDocuments: "/shipment-tracking/transport-documents",
  /** Per-shipment details under Track Shipment */
  shipmentTrackingDetail: "/shipment-tracking",

  documents: "/documents",
  documentsPurchaseOrders: "/documents/purchase-orders",
  documentsInvoices: "/documents/invoices",
  documentsProforma: "/documents/proforma-invoice",
  documentsGstInvoices: "/documents/gst-invoices",
  documentsCertificates: "/documents/certificates",
  documentsDownloads: "/documents/downloads",

  notifications: "/notifications",
  notificationsPurchaseRequests: "/notifications/purchase-requests",
  notificationsSellerApproval: "/notifications/seller-approval",
  notificationsOrders: "/notifications/orders",
  notificationsPayments: "/notifications/payments",
  notificationsShipment: "/notifications/shipment",
  notificationsOffers: "/notifications/offers",

  profile: "/profile",
  profileCompany: "/profile/company",
  profileGst: "/profile/gst",
  profilePan: "/profile/pan",
  profileAddresses: "/profile/addresses",
  profileBusiness: "/profile/business",
  profileBank: "/profile/bank",
  settings: "/settings",

  support: "/support",

  onboarding: "/customer/onboarding",
  onboardingCompany: "/customer/onboarding/company-information",
  onboardingGst: "/customer/onboarding/gst-verification",
  onboardingBusinessAddress: "/customer/onboarding/business-address",
  onboardingShipping: "/customer/onboarding/shipping-address",
  onboardingCredit: "/customer/onboarding/credit-eligibility",
  onboardingCompletion: "/customer/onboarding/completion",
} as const;

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
  ROUTES.notifications,
  ROUTES.profile,
  ROUTES.support,
  ROUTES.settings,
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
        title: "Browse Products",
        href: ROUTES.marketplace,
      },
      {
        id: "marketplace-categories",
        title: "Categories",
        href: ROUTES.marketplaceCategories,
      },
      {
        id: "marketplace-offers",
        title: "Offers",
        href: ROUTES.marketplaceOffers,
        badge: 3,
        badgeVariant: "pending",
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
    children: [
      {
        id: "pr-active",
        title: "Active Requests",
        href: ROUTES.purchaseRequestsActive,
        badge: 6,
        badgeVariant: "default",
      },
      {
        id: "pr-pending",
        title: "Pending Seller Approval",
        href: ROUTES.purchaseRequestsPending,
        badge: 4,
        badgeVariant: "pending",
      },
      {
        id: "pr-approved",
        title: "Approved Requests",
        href: ROUTES.purchaseRequestsApproved,
        badge: 2,
        badgeVariant: "approved",
      },
      {
        id: "pr-rejected",
        title: "Rejected Requests",
        href: ROUTES.purchaseRequestsRejected,
        badge: 1,
        badgeVariant: "rejected",
      },
      {
        id: "pr-expired",
        title: "Expired Requests",
        href: ROUTES.purchaseRequestsExpired,
        badge: 3,
        badgeVariant: "expired",
      },
      {
        id: "pr-history",
        title: "Request History",
        href: ROUTES.purchaseRequestsHistory,
      },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    href: ROUTES.orders,
    icon: "Package",
    badge: 5,
    badgeVariant: "processing",
    children: [
      {
        id: "orders-active",
        title: "Active Orders",
        href: ROUTES.ordersActive,
        badge: 5,
        badgeVariant: "processing",
      },
      {
        id: "orders-processing",
        title: "Processing",
        href: ROUTES.ordersProcessing,
        badge: 2,
        badgeVariant: "processing",
      },
      {
        id: "orders-ready",
        title: "Ready for Dispatch",
        href: ROUTES.ordersReadyForDispatch,
        badge: 1,
        badgeVariant: "dispatched",
      },
      {
        id: "orders-transit",
        title: "In Transit",
        href: ROUTES.ordersInTransit,
        badge: 2,
        badgeVariant: "dispatched",
      },
      {
        id: "orders-delivered",
        title: "Delivered",
        href: ROUTES.ordersDelivered,
        badge: 12,
        badgeVariant: "delivered",
      },
      {
        id: "orders-cancelled",
        title: "Cancelled",
        href: ROUTES.ordersCancelled,
        badge: 1,
        badgeVariant: "cancelled",
      },
      {
        id: "orders-reorder",
        title: "Reorder",
        href: ROUTES.ordersReorder,
      },
    ],
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
        id: "pay-advance",
        title: "Advance Payment",
        href: ROUTES.paymentsAdvance,
      },
      {
        id: "pay-loading",
        title: "On Loading Payment",
        href: ROUTES.paymentsOnLoading,
      },
      {
        id: "pay-delivery",
        title: "On Delivery Payment",
        href: ROUTES.paymentsOnDelivery,
      },
      {
        id: "pay-credit-15",
        title: "Credit 15 Days",
        href: ROUTES.paymentsCredit15,
      },
      {
        id: "pay-credit-30",
        title: "Credit 30 Days",
        href: ROUTES.paymentsCredit30,
      },
      {
        id: "pay-history",
        title: "Payment History",
        href: ROUTES.paymentsHistory,
      },
      {
        id: "pay-invoices",
        title: "Invoices",
        href: ROUTES.paymentsInvoices,
        badge: 2,
        badgeVariant: "pending",
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
        id: "ship-timeline",
        title: "Shipment Timeline",
        href: ROUTES.shipmentTimeline,
      },
      {
        id: "ship-updates",
        title: "Delivery Updates",
        href: ROUTES.shipmentDeliveryUpdates,
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
        href: ROUTES.documentsPurchaseOrders,
      },
      {
        id: "docs-invoices",
        title: "Invoices",
        href: ROUTES.documentsInvoices,
      },
      {
        id: "docs-proforma",
        title: "Proforma Invoice",
        href: ROUTES.documentsProforma,
      },
      {
        id: "docs-gst",
        title: "GST Invoices",
        href: ROUTES.documentsGstInvoices,
      },
      {
        id: "docs-certs",
        title: "Certificates",
        href: ROUTES.documentsCertificates,
      },
      {
        id: "docs-downloads",
        title: "Downloads",
        href: ROUTES.documentsDownloads,
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    href: ROUTES.notifications,
    icon: "Bell",
    badge: 7,
    badgeVariant: "pending",
    children: [
      {
        id: "notif-pr",
        title: "Purchase Requests",
        href: ROUTES.notificationsPurchaseRequests,
        badge: 2,
        badgeVariant: "pending",
      },
      {
        id: "notif-seller",
        title: "Seller Approval",
        href: ROUTES.notificationsSellerApproval,
        badge: 4,
        badgeVariant: "pending",
      },
      {
        id: "notif-orders",
        title: "Orders",
        href: ROUTES.notificationsOrders,
      },
      {
        id: "notif-payments",
        title: "Payments",
        href: ROUTES.notificationsPayments,
        badge: 1,
        badgeVariant: "pending",
      },
      {
        id: "notif-shipment",
        title: "Shipment",
        href: ROUTES.notificationsShipment,
      },
      {
        id: "notif-offers",
        title: "Offers",
        href: ROUTES.notificationsOffers,
      },
    ],
  },
  {
    id: "profile",
    title: "Profile",
    href: ROUTES.profile,
    icon: "User",
    children: [
      {
        id: "profile-company",
        title: "Company Profile",
        href: ROUTES.profileCompany,
      },
      {
        id: "profile-gst",
        title: "GST",
        href: ROUTES.profileGst,
      },
      {
        id: "profile-pan",
        title: "PAN",
        href: ROUTES.profilePan,
      },
      {
        id: "profile-addresses",
        title: "Addresses",
        href: ROUTES.profileAddresses,
      },
      {
        id: "profile-business",
        title: "Business Details",
        href: ROUTES.profileBusiness,
      },
      {
        id: "profile-bank",
        title: "Bank Details",
        href: ROUTES.profileBank,
      },
      {
        id: "profile-settings",
        title: "Settings",
        href: ROUTES.settings,
      },
    ],
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
