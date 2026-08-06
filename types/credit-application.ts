/** Credit application workflow — frontend MVP types */

export type CreditAccountStatus =
  "approved" | "pending" | "rejected" | "not_applied";

export type CreditApplicationStep = "apply" | "upload" | "review" | "decision";

export type CreditTermOption = "net_15" | "net_30";

export type MonthlyPurchaseBand =
  "below_5l" | "5l_10l" | "10l_25l" | "25l_50l" | "above_50l";

export type CreditDocumentId =
  | "gst_registration"
  | "gst_returns"
  | "bank_statement"
  | "itr_financials"
  | "cancelled_cheque"
  | "business_registration";

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
  /** Provided during customer onboarding — not re-requested */
  source?: "onboarding" | "application";
}

export interface CurrentCreditProfile {
  status: CreditAccountStatus;
  approvedLimit: number;
  availableCredit: number;
  creditUsed: number;
  paymentTerms: string;
}

export interface CreditApplicationDraft {
  requestedLimit: string;
  creditTerm: CreditTermOption;
  monthlyPurchase: MonthlyPurchaseBand | "";
  purpose: string;
  documents: Partial<Record<CreditDocumentId, UploadedCreditDocument>>;
  declarationAccepted: boolean;
}

export interface SubmittedCreditApplication {
  applicationId: string;
  requestedLimit: number;
  creditTerm: CreditTermOption;
  submittedAt: string;
  status: "pending_review";
}
