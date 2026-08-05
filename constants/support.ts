import type {
  KnowledgeCategoryId,
  SupportSectionId,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/types/support";

const SUPPORT_ROOT = "/support";

export const SUPPORT_ROUTES = {
  root: SUPPORT_ROOT,
  tickets: `${SUPPORT_ROOT}/tickets`,
  liveChat: `${SUPPORT_ROOT}/live-chat`,
  accountManager: `${SUPPORT_ROOT}/account-manager`,
  documentation: `${SUPPORT_ROOT}/documentation`,
  knowledgeBase: `${SUPPORT_ROOT}/knowledge-base`,
  settings: `${SUPPORT_ROOT}/settings`,
} as const;

export const SUPPORT_NAV: Array<{
  id: SupportSectionId;
  title: string;
  href: string;
  icon: string;
  badgeKey?: "openTickets";
}> = [
  {
    id: "overview",
    title: "Overview",
    href: SUPPORT_ROUTES.root,
    icon: "LayoutDashboard",
  },
  {
    id: "tickets",
    title: "My Tickets",
    href: SUPPORT_ROUTES.tickets,
    icon: "Ticket",
    badgeKey: "openTickets",
  },
  {
    id: "live-chat",
    title: "Live Chat",
    href: SUPPORT_ROUTES.liveChat,
    icon: "MessageSquare",
  },
  {
    id: "documentation",
    title: "Documentation",
    href: SUPPORT_ROUTES.documentation,
    icon: "BookOpen",
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base",
    href: SUPPORT_ROUTES.knowledgeBase,
    icon: "Library",
  },
];

export const TICKET_CATEGORY_OPTIONS: Array<{
  value: TicketCategory;
  label: string;
}> = [
  { value: "payment", label: "Payment" },
  { value: "orders", label: "Orders" },
  { value: "shipment", label: "Shipment" },
  { value: "invoice", label: "Invoice" },
  { value: "gst", label: "GST" },
  { value: "credit", label: "Credit" },
  { value: "technical", label: "Technical" },
  { value: "marketplace", label: "Marketplace" },
  { value: "others", label: "Others" },
];

export const TICKET_PRIORITY_OPTIONS: Array<{
  value: TicketPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

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

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> =
  Object.fromEntries(
    TICKET_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<TicketCategory, string>;

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategoryId, string> = {
  orders: "Orders",
  payments: "Payments",
  credit: "Credit",
  invoices: "Invoices",
  logistics: "Logistics",
  marketplace: "Marketplace",
};

export const ALLOWED_ATTACHMENT_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const SUPPORT_SLA_COPY =
  "PetroTrade Support typically responds within 4 business hours for Critical tickets and 24 hours for standard requests.";
