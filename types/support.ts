export type TicketStatus =
  "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";

export type TicketPriority = "low" | "medium" | "high" | "critical";

export type TicketCategory =
  | "payment"
  | "orders"
  | "shipment"
  | "invoice"
  | "gst"
  | "technical"
  | "marketplace"
  | "credit"
  | "others";

export type SupportSectionId =
  | "overview"
  | "tickets"
  | "live-chat"
  | "documentation"
  | "knowledge-base"
  | "settings";

export type KnowledgeCategoryId =
  "orders" | "payments" | "credit" | "invoices" | "logistics" | "marketplace";

export type ChatSender = "customer" | "executive" | "system";

export type SupportActivityType =
  | "ticket_assigned"
  | "payment_verified"
  | "shipment_updated"
  | "invoice_generated"
  | "ticket_replied"
  | "credit_updated";

export interface TicketAttachment {
  id: string;
  name: string;
  sizeLabel: string;
  mimeType: string;
  uploadedAt: string;
}

export interface TicketTimelineEvent {
  id: string;
  label: string;
  description: string;
  at: string;
  actor: string;
}

export interface TicketMessage {
  id: string;
  sender: ChatSender;
  senderName: string;
  body: string;
  at: string;
  read?: boolean;
  attachmentName?: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  category: TicketCategory;
  categoryLabel: string;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: string;
  assignedEmail?: string;
  attachments: TicketAttachment[];
  timeline: TicketTimelineEvent[];
  conversation: TicketMessage[];
  internalNotes: string[];
  relatedOrderId?: string;
}

export interface RaiseTicketInput {
  category: TicketCategory;
  priority?: TicketPriority;
  subject: string;
  description: string;
  attachmentName?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface AccountManager {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  availability: string;
  online: boolean;
  photoInitials: string;
  location: string;
  responseSla: string;
}

export interface SupportDoc {
  id: string;
  title: string;
  description: string;
  category: string;
  fileName: string;
  pages: number;
  updatedAt: string;
  content: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  shortDescription: string;
  category: KnowledgeCategoryId;
  readTime: string;
  popular?: boolean;
  content: string;
}

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  senderName: string;
  body: string;
  at: string;
  read?: boolean;
  attachmentName?: string;
}

export interface SupportActivity {
  id: string;
  type: SupportActivityType;
  title: string;
  description: string;
  at: string;
  read: boolean;
}

export interface SupportStatusSummary {
  openTickets: number;
  paymentVerificationPending: number;
  shipmentIssuesActive: number;
  resolvedThisMonth: number;
}

export interface SupportFiltersState {
  search: string;
  status: TicketStatus | "all";
  priority: TicketPriority | "all";
  dateFrom: string;
  dateTo: string;
}

export interface SupportDocPreviewState {
  open: boolean;
  docId: string;
  title: string;
  content: string;
  fileName: string;
}

export interface SupportPreferences {
  emailAlerts: boolean;
  smsAlerts: boolean;
  ticketUpdates: boolean;
  chatSound: boolean;
}
