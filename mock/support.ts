import type {
  AccountManager,
  ChatMessage,
  FaqItem,
  KnowledgeArticle,
  SupportActivity,
  SupportDoc,
  SupportStatusSummary,
  SupportTicket,
} from "@/types/support";
import { TICKET_CATEGORY_LABELS } from "@/constants/support";

export const ACCOUNT_MANAGER: AccountManager = {
  id: "am-1",
  name: "Sanya Gupta",
  designation: "Senior Account Manager",
  department: "Enterprise Customer Success",
  phone: "+91 9876543210",
  email: "sanya@petrotrade.com",
  availability: "Mon–Fri · 9:30 AM – 6:30 PM IST",
  online: true,
  photoInitials: "SG",
  location: "Mumbai · West India Desk",
  responseSla: "Direct line · typically answers within 15 minutes",
};

function msg(
  id: string,
  sender: "customer" | "executive" | "system",
  senderName: string,
  body: string,
  at: string,
  extras?: Partial<ChatMessage>,
): ChatMessage {
  return { id, sender, senderName, body, at, read: true, ...extras };
}

export const MOCK_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "tkt-00101",
    ticketId: "SUP-2026-00101",
    category: "shipment",
    categoryLabel: TICKET_CATEGORY_LABELS.shipment,
    priority: "high",
    status: "open",
    subject: "Delayed Delivery",
    description:
      "Shipment SHP-22901 was expected yesterday but has not arrived at our Kalamboli godown. Please provide updated ETA.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: "Priya Nair",
    assignedEmail: "priya.nair@petrotrade.com",
    relatedOrderId: "ORD-88390",
    attachments: [],
    timeline: [
      {
        id: "tl-1",
        label: "Ticket Created",
        description: "Raised via Help & Support",
        at: new Date().toISOString(),
        actor: "You",
      },
    ],
    conversation: [
      {
        id: "c-1",
        sender: "customer",
        senderName: "You",
        body: "Shipment is delayed — please confirm revised delivery date.",
        at: new Date().toISOString(),
        read: true,
      },
    ],
    internalNotes: [],
  },
  {
    id: "tkt-00102",
    ticketId: "SUP-2026-00102",
    category: "payment",
    categoryLabel: TICKET_CATEGORY_LABELS.payment,
    priority: "high",
    status: "in_progress",
    subject: "UTR not reflecting for advance payment",
    description:
      "We transferred ₹18,40,000 via NEFT (UTR: AXIS240803918827) on 02 Aug 2026. Payment tracker still shows Pending Verification.",
    createdAt: "2026-08-02T09:20:00.000Z",
    updatedAt: "2026-08-03T14:10:00.000Z",
    assignedTo: "Rahul Mehta",
    assignedEmail: "rahul.mehta@petrotrade.com",
    relatedOrderId: "ORD-88421",
    attachments: [],
    timeline: [
      {
        id: "tl-2",
        label: "Ticket Created",
        description: "Raised via Help & Support",
        at: "2026-08-02T09:20:00.000Z",
        actor: "You",
      },
      {
        id: "tl-3",
        label: "Under Review",
        description: "UTR validation requested with treasury desk",
        at: "2026-08-03T11:05:00.000Z",
        actor: "Rahul Mehta",
      },
    ],
    conversation: [
      {
        id: "c-2",
        sender: "customer",
        senderName: "You",
        body: "Please verify UTR AXIS240803918827 against ORD-88421.",
        at: "2026-08-02T09:21:00.000Z",
        read: true,
      },
      {
        id: "c-3",
        sender: "executive",
        senderName: "Rahul Mehta",
        body: "Received. We have escalated this to the treasury queue. Please keep the NEFT advice handy.",
        at: "2026-08-02T10:02:00.000Z",
        read: true,
      },
    ],
    internalNotes: [],
  },
  {
    id: "tkt-00103",
    ticketId: "SUP-2026-00103",
    category: "orders",
    categoryLabel: TICKET_CATEGORY_LABELS.orders,
    priority: "medium",
    status: "waiting_customer",
    subject: "Purchase request declined — need clarification",
    description:
      "PR-4502 was declined after PetroTrade review. Need commercial reason and options to resubmit.",
    createdAt: "2026-08-04T05:30:00.000Z",
    updatedAt: "2026-08-04T08:00:00.000Z",
    assignedTo: "Support Desk",
    attachments: [],
    timeline: [
      {
        id: "tl-4",
        label: "Ticket Created",
        description: "Raised via Help & Support",
        at: "2026-08-04T05:30:00.000Z",
        actor: "You",
      },
      {
        id: "tl-5",
        label: "Awaiting Response",
        description: "Support requested additional order details",
        at: "2026-08-04T08:00:00.000Z",
        actor: "Support Desk",
      },
    ],
    conversation: [
      {
        id: "c-4",
        sender: "executive",
        senderName: "Support Desk",
        body: "Please share the revised commercial terms so we can review your request again.",
        at: "2026-08-04T08:00:00.000Z",
        read: true,
      },
    ],
    internalNotes: [],
  },
  {
    id: "tkt-00098",
    ticketId: "SUP-2026-00098",
    category: "invoice",
    categoryLabel: TICKET_CATEGORY_LABELS.invoice,
    priority: "low",
    status: "resolved",
    subject: "Missing e-invoice IRN for INV-PO-7781",
    description:
      "GST portal shows IRN missing for July tax invoice. Need corrected JSON and PDF.",
    createdAt: "2026-07-20T08:00:00.000Z",
    updatedAt: "2026-07-22T12:40:00.000Z",
    assignedTo: "Ankit Shah",
    assignedEmail: "ankit.shah@petrotrade.com",
    relatedOrderId: "ORD-88102",
    attachments: [],
    timeline: [
      {
        id: "tl-6",
        label: "Ticket Created",
        description: "Raised via Help & Support",
        at: "2026-07-20T08:00:00.000Z",
        actor: "You",
      },
      {
        id: "tl-7",
        label: "Resolved",
        description: "Corrected IRN pushed to portal and email",
        at: "2026-07-22T12:40:00.000Z",
        actor: "Ankit Shah",
      },
    ],
    conversation: [
      {
        id: "c-5",
        sender: "executive",
        senderName: "Ankit Shah",
        body: "Corrected e-invoice is available under Documents → GST Invoices.",
        at: "2026-07-22T12:35:00.000Z",
        read: true,
      },
    ],
    internalNotes: [],
  },
  {
    id: "tkt-00095",
    ticketId: "SUP-2026-00095",
    category: "marketplace",
    categoryLabel: TICKET_CATEGORY_LABELS.marketplace,
    priority: "medium",
    status: "closed",
    subject: "HSN mismatch on Proforma for LDPE film grade",
    description:
      "Proforma showed HSN 3901 instead of 3902. Finance cannot book advance.",
    createdAt: "2026-07-10T13:15:00.000Z",
    updatedAt: "2026-07-12T09:00:00.000Z",
    assignedTo: "Ankit Shah",
    attachments: [],
    timeline: [
      {
        id: "tl-8",
        label: "Ticket Created",
        description: "Raised via Help & Support",
        at: "2026-07-10T13:15:00.000Z",
        actor: "You",
      },
      {
        id: "tl-9",
        label: "Closed",
        description: "Proforma regenerated with correct HSN",
        at: "2026-07-12T09:00:00.000Z",
        actor: "Ankit Shah",
      },
    ],
    conversation: [],
    internalNotes: [],
  },
];

export const MOCK_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "How to increase credit limit?",
    answer:
      "Open Support → Credit Assistance or raise a ticket under Credit. Attach latest audited financials, GSTR-3B, and board resolution. Your Account Manager packages the file for the credit committee. Standard turnaround is 3–5 business days for Enterprise accounts.",
    tags: ["credit", "limit"],
  },
  {
    id: "faq-2",
    question: "How is freight calculated?",
    answer:
      "Freight is computed from warehouse distance slabs, vehicle type (truck / trailer), and loadability. Spot rates refresh daily at 8 AM IST. Any redirection beyond 25 km may attract incremental freight as shown on the dispatch confirmation.",
    tags: ["shipment", "freight"],
  },
  {
    id: "faq-3",
    question: "How to upload payment proof?",
    answer:
      "Go to Payments → select the due payment → Upload Proof. Accept PDF, PNG, or JPEG of the NEFT/RTGS advice. Mention the UTR clearly. Support verifies against bank statement within 4 business hours for Critical purchases.",
    tags: ["payment", "utr"],
  },
  {
    id: "faq-4",
    question: "Where can I download invoices?",
    answer:
      "All tax invoices, proformas, and GST e-invoices are under Documents. Use filters by order number or supply source. You can preview online or download as PDF bundles.",
    tags: ["invoice", "documents"],
  },
  {
    id: "faq-5",
    question: "How do I track shipments?",
    answer:
      "Open Shipment Tracking from the main menu. Each active truck shows live ETA, e-way bill, and transport documents. Raise a logistics ticket if the GPS feed stalls for more than 2 hours.",
    tags: ["shipment", "tracking"],
  },
  {
    id: "faq-6",
    question: "What happens if PetroTrade declines a request?",
    answer:
      "Rejected purchase requests appear under Purchase Requests → Rejected with PetroTrade remark. You can reorder with revised commercial terms or raise a Support ticket for Account Manager mediation.",
    tags: ["orders", "rejection"],
  },
  {
    id: "faq-7",
    question: "How to raise quality complaint?",
    answer:
      "Create a ticket under Orders with Priority High, attach COA, weighbridge slip, and photos of packaging seals. Quality desk acknowledges within 24 hours and may arrange joint sampling.",
    tags: ["quality", "orders"],
  },
  {
    id: "faq-8",
    question: "How to download GST invoice?",
    answer:
      "Navigate to Documents → GST Invoices, search by IRN or invoice number, then Preview / Download. If IRN is missing, raise a GST category ticket — corrected JSON is usually pushed the same day.",
    tags: ["gst", "invoice"],
  },
];

export const MOCK_SUPPORT_DOCS: SupportDoc[] = [
  {
    id: "doc-gst",
    title: "GST Guide",
    description:
      "E-invoicing, IRN handling, HSN mapping, and credit/debit notes for polymer trades.",
    category: "Tax & Compliance",
    fileName: "petrotrade-gst-guide.pdf",
    pages: 18,
    updatedAt: "2026-06-12",
    content: `PETROTRADE ENTERPRISE — GST GUIDE
================================

1. E-Invoice lifecycle
   - PetroTrade generates IRN on confirmation of tax invoice.
   - Buyer downloads JSON/PDF from Documents → GST Invoices.

2. HSN references
   - PE grades: typically 3901
   - PP grades: typically 3902
   Validate against offer / proforma before payment.

3. Credit notes
   - Raised for quality claims or rate differences after delivery.
   - Must reference original IRN within the same financial year.

Contact sanya@petrotrade.com for tax desk escalations.`,
  },
  {
    id: "doc-purchase",
    title: "Purchase Process",
    description:
      "End-to-end buyer journey from marketplace browse to delivery confirmation.",
    category: "Operations",
    fileName: "purchase-process.pdf",
    pages: 12,
    updatedAt: "2026-05-28",
    content: `PURCHASE PROCESS — BUYER PLAYBOOK
=================================

Browse → Offer / Spot → Purchase Request → Order Confirmation → Payment → Dispatch → Delivery.

Tips:
- Lock price only when credit / advance readiness is confirmed.
- Attach PO reference in PR remarks for ERP reconciliation.`,
  },
  {
    id: "doc-credit",
    title: "Credit Policy",
    description:
      "Eligibility, temporary extensions, collateral, and overdue handling.",
    category: "Credit",
    fileName: "credit-policy.pdf",
    pages: 10,
    updatedAt: "2026-04-02",
    content: `CREDIT POLICY SUMMARY
=====================

Enterprise tiers: A / B / C based on offtake and repayment history.
Temporary extensions require Account Manager + Risk dual approval.
Late payment interest: as per signed MSA schedule.`,
  },
  {
    id: "doc-payment",
    title: "Payment Guide",
    description:
      "Advance, on-loading, on-delivery, and credit cycle settlement steps.",
    category: "Payments",
    fileName: "payment-guide.pdf",
    pages: 14,
    updatedAt: "2026-07-01",
    content: `PAYMENT GUIDE
=============

1. Advance — NEFT/RTGS with UTR upload
2. On Loading — payment before gate-out
3. On Delivery — pay against POD
4. Credit 15 / 30 — invoice date + net terms`,
  },
  {
    id: "doc-shipment",
    title: "Shipment Guide",
    description:
      "Dispatch slots, vehicle standards, diversion rules, and demurrage.",
    category: "Logistics",
    fileName: "shipment-guide.pdf",
    pages: 16,
    updatedAt: "2026-06-20",
    content: `SHIPMENT & LOGISTICS GUIDE
==========================

- Terminal slots: book 24h prior via tracker.
- Redirection: free within 25 km; beyond = freight delta.
- Required docs: e-way bill, LR, weighbridge, COA.`,
  },
  {
    id: "doc-quality",
    title: "Quality Policy",
    description:
      "Sampling, COA acceptance windows, and quality claim workflow.",
    category: "Quality",
    fileName: "quality-policy.pdf",
    pages: 9,
    updatedAt: "2026-03-15",
    content: `QUALITY POLICY
==============

Claims must be lodged within 48 hours of unloading.
Attach COA vs. lab report delta and sealed sample photos.`,
  },
  {
    id: "doc-safety",
    title: "Safety Certificates",
    description:
      "MSDS index, warehouse safety, and transporter compliance checklist.",
    category: "Safety",
    fileName: "safety-certificates.pdf",
    pages: 22,
    updatedAt: "2026-02-10",
    content: `SAFETY & COMPLIANCE PACK
========================

Includes MSDS summaries for PE/PP grades and transporter PPE checklist.`,
  },
];

export const MOCK_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "kb-1",
    title: "Verifying NEFT / RTGS UTRs in under 4 hours",
    shortDescription:
      "How Payments Ops matches bank advice to purchase requests.",
    category: "payments",
    readTime: "4 min",
    popular: true,
    content:
      "Upload a clear UTR screenshot, ensure amount matches to the rupee, and tag the PR number in remarks. Critical tickets skip the batch queue.",
  },
  {
    id: "kb-2",
    title: "Reading your live shipment timeline",
    shortDescription:
      "Understand each stage from warehouse release to POD upload.",
    category: "logistics",
    readTime: "5 min",
    popular: true,
    content:
      "Timeline stages: Assigned → Loaded → In Transit → Arrived → Unloaded → POD. GPS lag over 2 hours should be ticketed under Shipment.",
  },
  {
    id: "kb-3",
    title: "Credit eligibility checklist for Enterprise buyers",
    shortDescription: "Documents required for limit reviews and extensions.",
    category: "credit",
    readTime: "6 min",
    popular: true,
    content:
      "Prepare audited FY statements, last 6 GSTR-3B, bank statements, and board resolution authorizing limit increase.",
  },
  {
    id: "kb-4",
    title: "Downloading GST invoices with IRN",
    shortDescription: "Find, preview, and archive e-invoices for GST filing.",
    category: "invoices",
    readTime: "3 min",
    content:
      "Filter Documents by GST Invoices → search IRN or PetroTrade GSTIN → Preview validates signature hash before download.",
  },
  {
    id: "kb-5",
    title: "What to do when PetroTrade declines your PR",
    shortDescription: "Options for renegotiation, reorder, or mediation.",
    category: "orders",
    readTime: "4 min",
    popular: true,
    content:
      "Review PetroTrade remarks, adjust commercials, or escalate via Account Manager for strategic offtake programs.",
  },
  {
    id: "kb-6",
    title: "Marketplace offer locks and price validity",
    shortDescription: "How long spot and bulk offer prices remain actionable.",
    category: "marketplace",
    readTime: "3 min",
    content:
      "Spot locks typically hold 30–120 minutes. Bulk tier offers follow campaign end dates shown on the offer card.",
  },
  {
    id: "kb-7",
    title: "Upload checklist for payment proofs",
    shortDescription: "File types, naming, and common rejection reasons.",
    category: "payments",
    readTime: "3 min",
    content:
      "Accepted: PDF, PNG, JPEG. Rejected when UTR cropped, amount mismatch, or wrong beneficiary account.",
  },
  {
    id: "kb-8",
    title: "Transport documents every receiver must keep",
    shortDescription: "LR, e-way bill, weighbridge, and COA packing list.",
    category: "logistics",
    readTime: "4 min",
    content:
      "Download the transport pack from Shipment → Transport Documents before gate entry to avoid detention.",
  },
];

export const MOCK_CHAT_THREAD: ChatMessage[] = [
  msg(
    "chat-1",
    "executive",
    "Asha Krishnan",
    "Welcome to PetroTrade Live Support. You're connected to Asha from Enterprise Desk.",
    "2026-08-04T10:00:00.000Z",
  ),
  msg(
    "chat-2",
    "customer",
    "You",
    "Hello, I need invoice.",
    "2026-08-04T10:01:10.000Z",
  ),
  msg(
    "chat-3",
    "executive",
    "Asha Krishnan",
    "Sure, please provide Order Number.",
    "2026-08-04T10:01:40.000Z",
  ),
  msg(
    "chat-4",
    "customer",
    "You",
    "ORD-88421 — need GST tax invoice PDF for August filing.",
    "2026-08-04T10:02:15.000Z",
  ),
  msg(
    "chat-5",
    "executive",
    "Asha Krishnan",
    "Found INV-PO-88421. I can email it to your registered ID or you can download from Documents → GST Invoices.",
    "2026-08-04T10:03:05.000Z",
    { attachmentName: "INV-PO-88421.pdf" },
  ),
];

export const MOCK_SUPPORT_ACTIVITIES: SupportActivity[] = [
  {
    id: "act-1",
    type: "ticket_assigned",
    title: "Ticket Assigned",
    description: "SUP-10383 assigned to Priya Nair (Logistics)",
    at: "2026-08-03T07:00:00.000Z",
    read: false,
  },
  {
    id: "act-2",
    type: "payment_verified",
    title: "Payment Verified",
    description: "Advance for ORD-88210 marked Verified",
    at: "2026-08-02T18:20:00.000Z",
    read: false,
  },
  {
    id: "act-3",
    type: "shipment_updated",
    title: "Shipment Updated",
    description: "SHP-22901 ETA revised to 17:40 IST",
    at: "2026-08-04T08:15:00.000Z",
    read: true,
  },
  {
    id: "act-4",
    type: "invoice_generated",
    title: "Invoice Generated",
    description: "GST invoice for ORD-88102 is ready to download",
    at: "2026-08-01T11:40:00.000Z",
    read: true,
  },
];

export const MOCK_SUPPORT_SUMMARY: SupportStatusSummary = {
  openTickets: 3,
  paymentVerificationPending: 0,
  shipmentIssuesActive: 0,
  resolvedThisMonth: 2,
};

export const DEFAULT_SUPPORT_FILTERS = {
  search: "",
  status: "all" as const,
  priority: "all" as const,
  dateFrom: "",
  dateTo: "",
};

export const EXECUTIVE_CHAT_REPLIES = [
  "Thanks — I've noted that. Checking with the concerned desk now.",
  "I can see your account. Give me a moment to pull the latest record.",
  "Shared with your Account Manager Sanya Gupta as well for visibility.",
  "You can also track this under My Tickets once I convert this chat to a ticket.",
  "Is there anything else I can help with while we wait?",
];
