import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import { TICKET_CATEGORY_LABELS } from "@/constants/support";
import type {
  RaiseTicketInput,
  SupportTicket,
  TicketAttachment,
  TicketCategory,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from "@/types/support";

type BackendStatus =
  "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";

type BackendPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type BackendCategory =
  | "PAYMENT"
  | "ORDERS"
  | "SHIPMENT"
  | "INVOICE"
  | "GST"
  | "TECHNICAL"
  | "MARKETPLACE"
  | "CREDIT"
  | "INVENTORY"
  | "DISPATCH"
  | "COMPLIANCE"
  | "ACCOUNT"
  | "OTHERS";

type BackendMessage = {
  id: string;
  sender: "REQUESTER" | "AGENT" | "SYSTEM";
  senderName: string;
  body: string;
  attachmentName?: string | null;
  createdAt: string;
};

export type BackendSupportTicket = {
  id: string;
  ticketNumber: string;
  ticketId?: string;
  category: BackendCategory;
  categoryLabel?: string;
  priority: BackendPriority;
  status: BackendStatus;
  subject: string;
  description: string;
  relatedOrderId?: string | null;
  attachmentName?: string | null;
  assignedToName?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: BackendMessage[];
};

const STATUS_TO_UI: Record<BackendStatus, TicketStatus> = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  WAITING_CUSTOMER: "waiting_customer",
  RESOLVED: "resolved",
  CLOSED: "closed",
};

const PRIORITY_TO_UI: Record<BackendPriority, TicketPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

const CATEGORY_TO_UI: Record<BackendCategory, TicketCategory> = {
  PAYMENT: "payment",
  ORDERS: "orders",
  SHIPMENT: "shipment",
  INVOICE: "invoice",
  GST: "gst",
  TECHNICAL: "technical",
  MARKETPLACE: "marketplace",
  CREDIT: "credit",
  INVENTORY: "others",
  DISPATCH: "shipment",
  COMPLIANCE: "others",
  ACCOUNT: "credit",
  OTHERS: "others",
};

const CATEGORY_TO_API: Record<TicketCategory, BackendCategory> = {
  payment: "PAYMENT",
  orders: "ORDERS",
  shipment: "SHIPMENT",
  invoice: "INVOICE",
  gst: "GST",
  technical: "TECHNICAL",
  marketplace: "MARKETPLACE",
  credit: "CREDIT",
  others: "OTHERS",
};

const PRIORITY_TO_API: Record<TicketPriority, BackendPriority> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  critical: "CRITICAL",
};

function mapMessage(m: BackendMessage): TicketMessage {
  const sender =
    m.sender === "AGENT"
      ? "executive"
      : m.sender === "SYSTEM"
        ? "system"
        : "customer";
  return {
    id: m.id,
    sender,
    senderName: m.senderName,
    body: m.body,
    at: m.createdAt,
    read: true,
    attachmentName: m.attachmentName ?? undefined,
  };
}

export function mapSupportTicket(row: BackendSupportTicket): SupportTicket {
  const category = CATEGORY_TO_UI[row.category] ?? "others";
  const attachments: TicketAttachment[] = row.attachmentName
    ? [
        {
          id: `att-${row.id}`,
          name: row.attachmentName,
          sizeLabel: "—",
          mimeType: "application/octet-stream",
          uploadedAt: row.createdAt,
        },
      ]
    : [];

  return {
    id: row.id,
    ticketId: row.ticketNumber ?? row.ticketId ?? row.id,
    category,
    categoryLabel:
      row.categoryLabel ?? TICKET_CATEGORY_LABELS[category] ?? category,
    priority: PRIORITY_TO_UI[row.priority] ?? "medium",
    status: STATUS_TO_UI[row.status] ?? "open",
    subject: row.subject,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    assignedTo: row.assignedToName ?? "Queue — Support Desk",
    attachments,
    timeline: [
      {
        id: `tl-${row.id}`,
        label: "Ticket Created",
        description: "Submitted via Help & Support",
        at: row.createdAt,
        actor: "You",
      },
    ],
    conversation: (row.messages ?? []).map(mapMessage),
    internalNotes: [],
    relatedOrderId: row.relatedOrderId ?? undefined,
  };
}

export async function listCustomerSupportTickets(): Promise<SupportTicket[]> {
  const payload = await apiClient.get<Envelope<BackendSupportTicket[]>>(
    "/customer/support/tickets?limit=100",
  );
  return (payload.data ?? []).map(mapSupportTicket);
}

export async function createCustomerSupportTicket(
  input: RaiseTicketInput,
): Promise<SupportTicket> {
  const payload = await apiClient.post<Envelope<BackendSupportTicket>>(
    "/customer/support/tickets",
    {
      category: CATEGORY_TO_API[input.category],
      priority: PRIORITY_TO_API[input.priority ?? "medium"],
      subject: input.subject.trim(),
      description: input.description.trim(),
      attachmentName: input.attachmentName,
    },
  );
  if (!payload.data) {
    throw new Error("Failed to create support ticket");
  }
  return mapSupportTicket(payload.data);
}

export async function getCustomerSupportTicket(
  id: string,
): Promise<SupportTicket> {
  const payload = await apiClient.get<Envelope<BackendSupportTicket>>(
    `/customer/support/tickets/${id}`,
  );
  if (!payload.data) {
    throw new Error("Support ticket not found");
  }
  return mapSupportTicket(payload.data);
}
