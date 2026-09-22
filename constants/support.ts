import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/support";

const SUPPORT_ROOT = "/support";

export const SUPPORT_ROUTES = {
  root: SUPPORT_ROOT,
  /** Legacy aliases — all redirect to Help Center MVP */
  tickets: SUPPORT_ROOT,
  liveChat: SUPPORT_ROOT,
  accountManager: SUPPORT_ROOT,
  documentation: SUPPORT_ROOT,
  knowledgeBase: SUPPORT_ROOT,
  settings: SUPPORT_ROOT,
} as const;

export const SUPPORT_SLA_COPY =
  "Our support team typically responds within 24 business hours.";

export const SUPPORT_NAV: Array<{
  id: string;
  title: string;
  href: string;
  icon: string;
  badgeKey?: "openTickets";
}> = [
  {
    id: "overview",
    title: "Help & Support",
    href: SUPPORT_ROOT,
    icon: "LayoutDashboard",
  },
];

export const KNOWLEDGE_CATEGORY_LABELS = {
  orders: "Orders",
  payments: "Payments",
  credit: "Credit",
  invoices: "Tax Invoices",
  logistics: "Logistics",
  marketplace: "Marketplace",
} as const;

/** MVP raise-ticket category options */
export const MVP_TICKET_CATEGORY_OPTIONS: Array<{
  value: TicketCategory;
  label: string;
}> = [
  { value: "orders", label: "Order" },
  { value: "payment", label: "Payment" },
  { value: "shipment", label: "Shipment" },
  { value: "invoice", label: "Documents" },
  { value: "marketplace", label: "Marketplace" },
  { value: "credit", label: "Account" },
  { value: "others", label: "Other" },
];

export const TICKET_CATEGORY_OPTIONS = MVP_TICKET_CATEGORY_OPTIONS;

export const TICKET_PRIORITY_OPTIONS: Array<{
  value: TicketPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

/** MVP Help Center contact details */
export const SUPPORT_CONTACT = {
  phone: "+91 98765 43210",
  phoneHref: "tel:+919876543210",
  email: "support@petrotrade.com",
  emailHref: "mailto:support@petrotrade.com",
  businessHours: "Monday – Saturday",
  businessHoursTime: "9:00 AM – 7:00 PM IST",
  emergencyNote: "For urgent shipment issues please call directly.",
} as const;

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  payment: "Payment",
  orders: "Order",
  shipment: "Shipment",
  invoice: "Documents",
  gst: "Documents",
  technical: "Account",
  marketplace: "Marketplace",
  credit: "Account",
  others: "Other",
};

export const ALLOWED_ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Map internal statuses to MVP display labels */
export const MVP_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "Pending",
  waiting_customer: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const MVP_STATUS_CLASS: Record<string, string> = {
  Open: "bg-sky-50 text-sky-700 ring-sky-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function getMvpStatus(status: TicketStatus): string {
  return MVP_STATUS_LABELS[status];
}

/** Legacy exports for unused enterprise components */
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_customer: "Waiting Customer",
  resolved: "Resolved",
  closed: "Closed",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};
