import {
  CREDIT_DOCUMENT_DEFINITIONS,
  MONTHLY_PURCHASE_OPTIONS,
} from "@/mock/credit-application";
import type {
  CreditTermOption,
  MonthlyPurchaseBand,
  UploadedCreditDocument,
} from "@/types/credit-application";

export const CREDIT_LIMIT_MIN = 50_000;
export const CREDIT_LIMIT_MAX = 100_000_000;
export const CREDIT_PURPOSE_MIN_CHARS = 20;
export const CREDIT_REVIEW_BUSINESS_DAYS = 5;
export const CREDIT_REVIEW_SLA_LABEL = "2–5 business days";

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

export function requiredDocumentIds() {
  return CREDIT_DOCUMENT_DEFINITIONS.filter((d) => d.required).map((d) => d.id);
}

export function countRequiredUploaded(
  documents: Partial<Record<string, UploadedCreditDocument>>,
): { uploaded: number; required: number } {
  const required = requiredDocumentIds();
  const uploaded = required.filter((id) => Boolean(documents[id])).length;
  return { uploaded, required: required.length };
}

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

  for (const def of CREDIT_DOCUMENT_DEFINITIONS) {
    if (def.required && !input.documents[def.id]) {
      errors[`doc_${def.id}`] = `${def.title} is required.`;
    }
  }

  return errors;
}
