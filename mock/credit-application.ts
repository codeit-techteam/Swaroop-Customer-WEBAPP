import type {
  CreditDocumentDefinition,
  CurrentCreditProfile,
} from "@/types/credit-application";

export const currentCreditProfileMock: CurrentCreditProfile = {
  status: "approved",
  approvedLimit: 5_000_000,
  availableCredit: 3_750_000,
  creditUsed: 1_250_000,
  paymentTerms: "Net-15 Days",
};

export const CREDIT_DOCUMENT_DEFINITIONS: CreditDocumentDefinition[] = [
  {
    id: "gst_registration",
    title: "GST Registration Certificate",
    required: true,
    acceptLabel: "PDF",
  },
  {
    id: "gst_returns",
    title: "GST Returns",
    subtitle: "Last 6 Months (GSTR-3B)",
    required: true,
    acceptLabel: "PDF",
  },
  {
    id: "bank_statement",
    title: "Bank Statement",
    subtitle: "Last 6 Months",
    required: true,
    acceptLabel: "PDF",
  },
  {
    id: "itr_financials",
    title: "ITR / Financial Statements",
    subtitle: "Last 2 Years",
    required: true,
    acceptLabel: "PDF",
  },
  {
    id: "cancelled_cheque",
    title: "Cancelled Cheque",
    required: true,
    acceptLabel: "Image / PDF",
  },
  {
    id: "business_registration",
    title: "Business Registration Certificate",
    required: false,
    acceptLabel: "PDF",
  },
];

export const MONTHLY_PURCHASE_OPTIONS = [
  { value: "below_5l", label: "Below ₹5 Lakhs" },
  { value: "5l_10l", label: "₹5L – ₹10L" },
  { value: "10l_25l", label: "₹10L – ₹25L" },
  { value: "25l_50l", label: "₹25L – ₹50L" },
  { value: "above_50l", label: "Above ₹50L" },
] as const;

export const CREDIT_APPLICATION_STORAGE_KEY =
  "petrotrade.credit-application.v1";

export function generateCreditApplicationId(): string {
  const seq = Math.floor(Math.random() * 900) + 100;
  return `CRD-2026-${String(seq).padStart(5, "0")}`;
}
