/**
 * Purchase Request domain — mirrors SWAROOP Customer App checkout / payment /
 * order-awaiting / PO-generated flow, adapted for desktop PR routes.
 */

export type PaymentMethodId =
  "advance" | "on_loading" | "on_delivery" | "credit_15" | "credit_30";

export type PaymentBadgeVariant =
  "recommended" | "eligible" | "credit" | "premium";

export type PurchaseRequestStatus =
  | "draft"
  | "submitted"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "expired";

export type PurchaseRequestStep =
  | "create"
  | "review"
  | "payment"
  | "submitted"
  | "pending_approval"
  | "approved";

export type ValidationStepId =
  | "order_received"
  | "payment_verified"
  | "procurement_matching"
  | "price_reconfirmation"
  | "inventory_allocation"
  | "seller_acceptance"
  | "purchase_order_generation";

export type ValidationStepStatus = "completed" | "current" | "pending";

export type PriceLockStatus = "active" | "expired" | "released";

export interface PaymentMethodBadge {
  label: string;
  variant: PaymentBadgeVariant;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  title: string;
  description: string;
  badge?: PaymentMethodBadge;
  /** Flat discount in ₹ (Advance). */
  discount: number;
  /** Interest rate as percent, e.g. 1.5 */
  interestRate: number;
  creditLimit?: number;
  availableCredit?: number;
  timing: string;
  bestFor: string;
  hasCredit: boolean;
  benefits: string[];
  eligibility: string;
  risk: string;
  icon: "wallet" | "truck" | "package" | "calendar" | "calendar-check";
}

export interface PaymentCalculation {
  methodId: PaymentMethodId;
  methodTitle: string;
  baseAmount: number;
  discount: number;
  interest: number;
  interestRate: number;
  payableAmount: number;
}

export interface ShippingAddress {
  id: string;
  warehouseName: string;
  line1: string;
  line2: string;
  state: string;
  pincode: string;
  zoneLabel: string;
  cityShort: string;
  freightAmount: number;
  etaLabel: string;
}

export interface BillingAddress {
  id: string;
  label: string;
  companyName: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
}

export interface CreditEligibility {
  approved: boolean;
  creditLimit: number;
  availableCredit: number;
  creditUsed: number;
  remainingCredit: number;
  eligibleFor15: boolean;
  eligibleFor30: boolean;
  interest15: number;
  interest30: number;
}

export interface SelectedProduct {
  id: string;
  name: string;
  grade: string;
  manufacturer: string;
  warehouse: string;
  warehouseRegion: string;
  availableStock: number;
  moq: number;
  quantityIncrement: number;
  currentPricePerMt: number;
  packaging: string;
  imageUrl: string;
  materialType: string;
  eta: string;
}

export interface PurchaseRequestFormData {
  quantityMt: number;
  packaging: string;
  deliveryLocationId: string;
  expectedDeliveryDate: string;
  remarks: string;
  gstNumber: string;
  purchaseOrderReference: string;
  shippingAddressId: string;
  billingAddressId: string;
  sameAsShipping: boolean;
}

export interface OrderSummaryBreakdown {
  baseSubtotal: number;
  freight: number;
  freightLabel: string;
  gst: number;
  platformFee: number;
  insuranceIncluded: boolean;
  discount: number;
  interest: number;
  interestRate: number;
  totalBeforePayment: number;
  grandTotal: number;
  totalQuantityMt: number;
  ratePerMt: number;
}

export interface ValidationTimelineStep {
  id: ValidationStepId;
  title: string;
  subtitle?: string;
  status: ValidationStepStatus;
}

export interface SubmittedPurchaseRequest {
  id: string;
  displayId: string;
  orderId: string | null;
  poNumber: string | null;
  product: SelectedProduct;
  form: PurchaseRequestFormData;
  paymentMethodId: PaymentMethodId;
  paymentMethodTitle: string;
  summary: OrderSummaryBreakdown;
  status: PurchaseRequestStatus;
  priceLockStatus: PriceLockStatus;
  priceLockDurationSeconds: number;
  approvalStartedAt: string | null;
  expectedDispatch: string;
  createdAt: string;
  acceptedTerms: boolean;
  acceptedGstDeclaration: boolean;
}

export interface PurchaseRequestDraft {
  product: SelectedProduct | null;
  form: PurchaseRequestFormData;
  selectedPaymentMethodId: PaymentMethodId;
  acceptedTerms: boolean;
  acceptedGstDeclaration: boolean;
  currentStep: PurchaseRequestStep;
  submittedRequest: SubmittedPurchaseRequest | null;
}
