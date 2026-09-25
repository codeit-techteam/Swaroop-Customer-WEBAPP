/** Credit application workflow — mirrors the backend /customer/credit contract */

export type CreditAccountStatus =
  "approved" | "pending" | "rejected" | "not_applied";

export type CreditApplicationStep = "apply" | "upload" | "review" | "decision";

export type CreditWizardStep = "apply" | "upload";

export type CreditTermOption = "net_15" | "net_30";

export type MonthlyPurchaseBand =
  "below_5l" | "5l_10l" | "10l_25l" | "25l_50l" | "above_50l";

/** Document slots collected by the web wizard. */
export type CreditDocumentId =
  | "gst_registration"
  | "gst_returns"
  | "bank_statement"
  | "itr_financials"
  | "cancelled_cheque"
  | "business_registration";

/** Full set accepted by the backend (`CREDIT_APPLICATION_DOCUMENT_TYPES`). */
export type CreditDocumentType = CreditDocumentId | "other";

/** `CreditApplicationStatus` on the backend. */
export type CreditApplicationStatus =
  | "DRAFT"
  | "PENDING"
  | "DOCUMENTS_UNDER_REVIEW"
  | "UNDER_REVIEW"
  | "DOCUMENTS_REQUIRED"
  | "INSURANCE_REVIEW"
  | "CREDIT_ARRANGEMENT_PENDING"
  | "APPROVED"
  | "PARTIALLY_APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

export interface CreditDocumentDefinition {
  id: CreditDocumentId;
  title: string;
  subtitle?: string;
  required: boolean;
  acceptLabel: string;
}

export interface UploadedCreditDocument {
  id: CreditDocumentId;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  /** Storage document id returned by the backend. */
  documentId?: string;
  /** Backend `DocumentStatus` (UPLOADED / UNDER_REVIEW / VERIFIED / REJECTED). */
  status?: string;
  rejectionReason?: string | null;
  /** True when R2 is not configured and only metadata was recorded. */
  storagePending?: boolean;
  version?: number;
  source?: "application" | "onboarding";
}

// ---------------------------------------------------------------------------
// Backend projections
// ---------------------------------------------------------------------------

export interface CreditAccountSnapshot {
  id: string;
  accountNumber: string | null;
  status: string;
  accountStatus: string;
  approvedLimit: string;
  availableLimit: string;
  pendingCredit: string;
  utilizedAmount: string;
  outstandingAmount: string;
  overdueAmount: string;
  utilizationPercentage: number;
  currency: string;
  creditTermDays: number | null;
  approvedAt: string | null;
  expiresAt: string | null;
}

export interface CreditApplicationDocument {
  id: string;
  documentNumber: string;
  documentType: string;
  label: string;
  category: string;
  fileName: string;
  mimeType: string | null;
  fileSizeBytes: string | null;
  status: string;
  version: number;
  rejectionReason: string | null;
  storagePending: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreditRequiredDocumentItem {
  documentType: string;
  label: string;
  category: string;
  required: boolean;
  uploaded: boolean;
  documentId: string | null;
  status: string | null;
}

export interface CreditMissingDocument {
  documentType: string;
  label: string;
}

export interface CreditTimelineEvent {
  id: string;
  eventType: string;
  description: string;
  actorRole: string | null;
  customerVisible: boolean;
  metadata?: unknown;
  createdAt: string;
}

/** `GET /customer/credit/application` and `GET /customer/credit/applications/:id`. */
export interface CreditApplicationView {
  id: string;
  applicationNumber: string;
  status: CreditApplicationStatus;
  requestedLimit: string;
  requestedTenureDays: number | null;
  purpose: string | null;
  currency: string;
  approvedLimit: string | null;
  approvedTenureDays: number | null;
  insuranceStatus: string | null;
  arrangementStatus: string | null;
  customerMessage: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  effectiveAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  nextStep: string;
  canSubmit: boolean;
  requiredDocuments: CreditRequiredDocumentItem[];
  missingDocuments: CreditMissingDocument[];
  documents: CreditApplicationDocument[];
  timeline?: CreditTimelineEvent[];
  account: CreditAccountSnapshot | null;
  storage: { configured: boolean; pending: boolean };
}
