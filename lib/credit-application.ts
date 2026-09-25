import {
  CREDIT_DOCUMENT_DEFINITIONS,
  MONTHLY_PURCHASE_OPTIONS,
} from "@/mock/credit-application";
import type {
  CreditAccountStatus,
  CreditApplicationStatus,
  CreditApplicationStep,
  CreditDocumentId,
  CreditTermOption,
  MonthlyPurchaseBand,
  UploadedCreditDocument,
} from "@/types/credit-application";

export const CREDIT_LIMIT_MIN = 50_000;
export const CREDIT_LIMIT_MAX = 100_000_000;
export const CREDIT_PURPOSE_MIN_CHARS = 20;
export const CREDIT_REVIEW_BUSINESS_DAYS = 5;
export const CREDIT_REVIEW_SLA_LABEL = "2–5 business days";

/** Hard-required by `POST .../submit` regardless of the UI definitions. */
export const BACKEND_REQUIRED_CREDIT_DOCUMENT_IDS: CreditDocumentId[] = [
  "gst_registration",
  "bank_statement",
  "itr_financials",
];

export function parseCreditLimit(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function formatLimitInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-IN");
}

export function creditTermLabel(term: CreditTermOption): string {
  return term === "net_15" ? "Net-15 Days" : "Net-30 Days";
}

export function tenureDaysForTerm(term: CreditTermOption): number {
  return term === "net_15" ? 15 : 30;
}

export function creditTermFromTenureDays(
  days: number | null | undefined,
): CreditTermOption {
  return days === 15 ? "net_15" : "net_30";
}

/** Status card terms label — driven by the approved account, not the request. */
export function creditPaymentTermsLabel(
  creditTermDays: number | null | undefined,
): string {
  if (creditTermDays === 15) return "Net-15";
  if (creditTermDays === 30) return "Net-30";
  return "PetroTrade managed";
}

export function monthlyPurchaseLabel(band: MonthlyPurchaseBand | ""): string {
  if (!band) return "—";
  return (
    MONTHLY_PURCHASE_OPTIONS.find((opt) => opt.value === band)?.label ?? "—"
  );
}

export function addBusinessDays(fromIso: string, days: number): string {
  const date = new Date(fromIso);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) added += 1;
  }
  return date.toISOString();
}

export function requiredDocumentIds(): CreditDocumentId[] {
  const fromDefinitions = CREDIT_DOCUMENT_DEFINITIONS.filter(
    (d) => d.required,
  ).map((d) => d.id);
  const merged = new Set<CreditDocumentId>([
    ...fromDefinitions,
    ...BACKEND_REQUIRED_CREDIT_DOCUMENT_IDS,
  ]);
  return CREDIT_DOCUMENT_DEFINITIONS.filter((d) => merged.has(d.id)).map(
    (d) => d.id,
  );
}

export function countRequiredUploaded(
  documents: Partial<Record<string, UploadedCreditDocument>>,
): { uploaded: number; required: number } {
  const required = requiredDocumentIds();
  const uploaded = required.filter((id) => Boolean(documents[id])).length;
  return { uploaded, required: required.length };
}

// ---------------------------------------------------------------------------
// Backend status mapping
// ---------------------------------------------------------------------------

const REVIEW_STATUSES: CreditApplicationStatus[] = [
  "PENDING",
  "DOCUMENTS_UNDER_REVIEW",
  "UNDER_REVIEW",
  "INSURANCE_REVIEW",
  "CREDIT_ARRANGEMENT_PENDING",
];

const DECISION_STATUSES: CreditApplicationStatus[] = [
  "APPROVED",
  "PARTIALLY_APPROVED",
  "REJECTED",
];

const TERMINAL_STATUSES: CreditApplicationStatus[] = [
  ...DECISION_STATUSES,
  "EXPIRED",
  "CANCELLED",
];

export function isCreditReviewStatus(status: CreditApplicationStatus): boolean {
  return REVIEW_STATUSES.includes(status);
}

export function isCreditDecisionStatus(
  status: CreditApplicationStatus,
): boolean {
  return DECISION_STATUSES.includes(status);
}

export function isTerminalCreditStatus(
  status: CreditApplicationStatus,
): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/** True while the customer may still attach or replace documents. */
export function canEditCreditDocuments(
  status: CreditApplicationStatus,
): boolean {
  return (
    status === "DRAFT" ||
    status === "DOCUMENTS_REQUIRED" ||
    status === "PENDING"
  );
}

/** Backend status → stepper position. */
export function creditStepForStatus(
  status: CreditApplicationStatus,
): CreditApplicationStep {
  if (status === "DRAFT" || status === "DOCUMENTS_REQUIRED") return "upload";
  if (isCreditReviewStatus(status)) return "review";
  if (isCreditDecisionStatus(status)) return "decision";
  // EXPIRED / CANCELLED — the customer starts over.
  return "apply";
}

/** Backend status → status-card badge bucket. */
export function creditAccountStatusFor(
  displayStatus: string | null | undefined,
  applicationStatus?: CreditApplicationStatus | null,
): CreditAccountStatus {
  if (displayStatus === "ACTIVE" || displayStatus === "APPROVED")
    return "approved";
  if (
    applicationStatus === "APPROVED" ||
    applicationStatus === "PARTIALLY_APPROVED"
  ) {
    return "approved";
  }
  if (applicationStatus === "REJECTED" || displayStatus === "REJECTED") {
    return "rejected";
  }
  if (
    !applicationStatus &&
    (!displayStatus || displayStatus === "NOT_APPLIED")
  ) {
    return "not_applied";
  }
  if (applicationStatus === "DRAFT") return "not_applied";
  if (
    applicationStatus === "EXPIRED" ||
    applicationStatus === "CANCELLED" ||
    displayStatus === "EXPIRED"
  ) {
    return "not_applied";
  }
  return "pending";
}

const STATUS_LABELS: Record<CreditApplicationStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  DOCUMENTS_UNDER_REVIEW: "Documents under review",
  UNDER_REVIEW: "Under review",
  DOCUMENTS_REQUIRED: "Documents required",
  INSURANCE_REVIEW: "Insurance review",
  CREDIT_ARRANGEMENT_PENDING: "Arrangement pending",
  APPROVED: "Approved",
  PARTIALLY_APPROVED: "Partially approved",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export function creditStatusLabel(status: CreditApplicationStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function creditStatusBadgeVariant(
  status: CreditApplicationStatus,
): "success" | "warning" | "destructive" | "outline" {
  if (status === "APPROVED" || status === "PARTIALLY_APPROVED")
    return "success";
  if (status === "REJECTED") return "destructive";
  if (status === "EXPIRED" || status === "CANCELLED" || status === "DRAFT") {
    return "outline";
  }
  return "warning";
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateApplyFields(input: {
  requestedLimit: string;
  monthlyPurchase: MonthlyPurchaseBand | "";
  purpose: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const limit = parseCreditLimit(input.requestedLimit);

  if (!limit || limit <= 0) {
    errors.requestedLimit = "Enter a valid requested credit limit.";
  } else if (limit < CREDIT_LIMIT_MIN) {
    errors.requestedLimit = `Minimum request is ₹${CREDIT_LIMIT_MIN.toLocaleString("en-IN")}.`;
  } else if (limit > CREDIT_LIMIT_MAX) {
    errors.requestedLimit = `Maximum request is ₹${CREDIT_LIMIT_MAX.toLocaleString("en-IN")}.`;
  }

  if (!input.monthlyPurchase) {
    errors.monthlyPurchase = "Select expected monthly purchase volume.";
  }

  const purpose = input.purpose.trim();
  if (!purpose) {
    errors.purpose = "Describe why you require trading credit.";
  } else if (purpose.length < CREDIT_PURPOSE_MIN_CHARS) {
    errors.purpose = `Add a bit more detail (at least ${CREDIT_PURPOSE_MIN_CHARS} characters).`;
  }

  return errors;
}

export function validateUploadFields(input: {
  documents: Partial<Record<string, UploadedCreditDocument>>;
  declarationAccepted: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.declarationAccepted) {
    errors.declaration = "You must accept the declaration to proceed.";
  }

  for (const id of requiredDocumentIds()) {
    if (input.documents[id]) continue;
    const def = CREDIT_DOCUMENT_DEFINITIONS.find((d) => d.id === id);
    errors[`doc_${id}`] = `${def?.title ?? "Document"} is required.`;
  }

  return errors;
}
