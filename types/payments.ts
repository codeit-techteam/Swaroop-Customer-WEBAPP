/**
 * Payments module types — enterprise B2B petrochemical procurement.
 */

export type PaymentTypeId =
  "advance" | "on_loading" | "on_delivery" | "credit_15" | "credit_30";

/** Dashboard / list payment lifecycle status */
export type PaymentStatus =
  | "pending"
  | "paid"
  | "processing"
  | "failed"
  | "refunded"
  | "overdue"
  | "cancelled"
  | "pending_payment"
  | "payment_submitted"
  | "verification_pending"
  | "verified"
  | "rejected"
  | "need_clarification";

export type TransferMethodId =
  "NEFT" | "RTGS" | "IMPS" | "UPI" | "Corporate Banking" | "Net Banking";

export type InvoiceStatus =
  "issued" | "paid" | "overdue" | "cancelled" | "draft";

export type ReceiptStatus = "generated" | "void";

export type TimelineStepStatus =
  "completed" | "current" | "upcoming" | "failed";

export type PaymentTimelineStepId =
  | "purchase_request"
  | "seller_approved"
  | "order_generated"
  | "advance_pending"
  | "payment_initiated"
  | "payment_submitted"
  | "utr_uploaded"
  | "finance_verification"
  | "payment_approved"
  | "payment_processing"
  | "payment_success"
  | "invoice_generated"
  | "receipt_generated"
  | "order_processing"
  | "loading_started"
  | "payment_required"
  | "shipment_arrived";

export interface PaymentTimelineStep {
  id: PaymentTimelineStepId;
  title: string;
  description?: string;
  status: TimelineStepStatus;
  at?: string;
}

export interface PaymentProofUpload {
  fileName: string;
  fileType: string;
  fileSize: number;
  previewUrl?: string;
  uploadedAt: string;
}

export interface PaymentProof {
  transactionType: TransferMethodId;
  utr: string;
  transactionDate: string;
  transactionTime: string;
  paidAmount: number;
  remarks?: string;
  screenshot?: PaymentProofUpload;
  receipt?: PaymentProofUpload;
  bankAdvice?: PaymentProofUpload;
  submittedAt: string;
}

export interface PaymentRejection {
  reason:
    | "utr_not_found"
    | "screenshot_blurry"
    | "incorrect_amount"
    | "duplicate_utr"
    | "mismatch"
    | "other";
  message: string;
  rejectedAt: string;
  rejectedBy?: string;
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  orderNumber: string;
  poNumber: string;
  product: string;
  productGrade?: string;
  seller: string;
  warehouse: string;
  quantityMt: number;
  paymentType: PaymentTypeId;
  amount: number;
  gst: number;
  freight: number;
  insurance: number;
  totalAmount: number;
  advancePercent?: number;
  amountPaid: number;
  remainingBalance: number;
  status: PaymentStatus;
  paymentDate?: string;
  dueDate: string;
  transactionId?: string;
  invoiceNumber?: string;
  paymentReference?: string;
  utrNumber?: string;
  paymentMethod?: TransferMethodId;
  receiptNumber?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  interest?: number;
  loadingPercent?: number;
  vehicleNumber?: string;
  driverName?: string;
  dispatchEta?: string;
  deliveryDate?: string;
  shipmentStatus?: string;
  proof?: PaymentProof;
  rejection?: PaymentRejection;
  timeline: PaymentTimelineStep[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  poNumber: string;
  paymentId: string;
  product: string;
  seller: string;
  warehouse: string;
  amount: number;
  gst: number;
  freight: number;
  insurance: number;
  totalAmount: number;
  issueDate: string;
  status: InvoiceStatus;
  paymentType: PaymentTypeId;
  advancePaymentStatus?: PaymentStatus;
  transactionId?: string;
  utrNumber?: string;
  verificationDate?: string;
}

export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  paymentId: string;
  orderNumber: string;
  poNumber: string;
  invoiceNumber?: string;
  transactionId: string;
  utrNumber?: string;
  amount: number;
  gst: number;
  totalAmount: number;
  paymentMethod: TransferMethodId;
  paymentType: PaymentTypeId;
  paymentDate: string;
  verificationDate?: string;
  status: ReceiptStatus;
  seller: string;
  warehouse: string;
}

export interface PaymentNotification {
  id: string;
  type:
    | "advance_due"
    | "credit_due_tomorrow"
    | "payment_successful"
    | "invoice_ready"
    | "receipt_generated"
    | "verification_pending"
    | "payment_rejected"
    | "payment_verified";
  title: string;
  message: string;
  paymentId?: string;
  orderNumber?: string;
  createdAt: string;
  read: boolean;
}

export interface CreditSummary {
  availableCredit: number;
  usedCredit: number;
  remainingCredit: number;
  creditLimit: number;
  paymentDueDate?: string;
  countdownDays?: number;
  utilizationPercent: number;
  nextBillingCycle?: string;
  outstanding: number;
}

export interface PaymentsDashboardSummary {
  totalOutstanding: number;
  paidThisMonth: number;
  pendingPayments: number;
  upcomingCreditDue: number;
  overduePayments: number;
  availableCredit: number;
}

export interface PaymentsFiltersState {
  search: string;
  status: PaymentStatus | "all";
  paymentType: PaymentTypeId | "all";
  warehouse: string | "all";
  seller: string | "all";
  dateFrom: string;
  dateTo: string;
  sortBy: "dueDate" | "amount" | "paymentDate" | "orderNumber" | "status";
  sortDir: "asc" | "desc";
}

export interface TransferBankDetails {
  beneficiaryName: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  upiQrLabel: string;
}

export interface UploadProofFormState {
  transactionType: TransferMethodId;
  utr: string;
  transactionDate: string;
  transactionTime: string;
  paidAmount: number;
  remarks: string;
  screenshot: PaymentProofUpload | null;
  receipt: PaymentProofUpload | null;
  bankAdvice: PaymentProofUpload | null;
}
