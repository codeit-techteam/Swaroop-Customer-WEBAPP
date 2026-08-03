import type {
  PaymentStatus,
  PaymentTypeId,
  TransferBankDetails,
  TransferMethodId,
} from "@/types/payments";

export const PETROTRADE_TRANSFER_BANK: TransferBankDetails = {
  beneficiaryName: "PetroTrade Technologies Pvt Ltd",
  bankName: "HDFC Bank",
  branch: "Bandra Kurla Complex, Mumbai",
  accountNumber: "50200034823421",
  ifsc: "HDFC0002231",
  upiId: "payments@petrotrade",
  upiQrLabel: "Scan to pay via UPI",
};

export const TRANSFER_METHODS: TransferMethodId[] = [
  "NEFT",
  "RTGS",
  "IMPS",
  "UPI",
  "Corporate Banking",
  "Net Banking",
];

export const PAYMENT_TYPE_LABELS: Record<PaymentTypeId, string> = {
  advance: "Advance Payment",
  on_loading: "On Loading Payment",
  on_delivery: "On Delivery Payment",
  credit_15: "Credit 15 Days",
  credit_30: "Credit 30 Days",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  failed: "Failed",
  refunded: "Refunded",
  overdue: "Overdue",
  cancelled: "Cancelled",
  pending_payment: "Pending Payment",
  payment_submitted: "Payment Submitted",
  verification_pending: "Verification Pending",
  verified: "Verified",
  rejected: "Rejected",
  need_clarification: "Need Clarification",
};

export const REJECTION_REASON_LABELS: Record<string, string> = {
  utr_not_found: "UTR Not Found",
  screenshot_blurry: "Screenshot Blurry",
  incorrect_amount: "Incorrect Amount",
  duplicate_utr: "Duplicate UTR",
  mismatch: "Mismatch",
  other: "Other",
};

export const UTR_MIN_LENGTH = 8;
export const UTR_MAX_LENGTH = 30;
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
] as const;

export const CREDIT_15_SUMMARY = {
  creditLimit: 50_00_000,
  interestRate: 1.5,
} as const;

export const CREDIT_30_SUMMARY = {
  creditLimit: 75_00_000,
  interestRate: 2.5,
} as const;

export const PRODUCTS = [
  "PP Raffia",
  "HDPE",
  "PVC Resin",
  "PET Resin",
  "LLDPE",
] as const;

export const WAREHOUSES = [
  "Jamnagar",
  "Hazira",
  "Dahej",
  "Mundra",
  "Panipat",
  "Paradip",
] as const;

export const SELLERS = [
  "Reliance Polymers",
  "IOCL Petrochem",
  "Haldia Petrochemicals",
  "GAIL Polymers",
  "Nayara Energy",
  "OPAL Polymers",
] as const;

export function paymentsAdvancePayPath(id: string) {
  return `/payments/advance/${id}`;
}

export function paymentsAdvanceUploadPath(id: string) {
  return `/payments/advance/${id}/upload`;
}

export function paymentsAdvanceSuccessPath(id: string) {
  return `/payments/advance/${id}/success`;
}

export function paymentsAdvanceTrackerPath(id: string) {
  return `/payments/advance/${id}/tracker`;
}

export function paymentsAdvanceVerifiedPath(id: string) {
  return `/payments/advance/${id}/verified`;
}

export function paymentsDetailPath(id: string) {
  return `/payments/${id}`;
}
