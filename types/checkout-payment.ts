/**
 * Checkout payment selection — selected before Purchase Order creation
 * so seller approval can consider payment terms (esp. Credit / COD).
 */

export type CheckoutPaymentMethodId =
  "advance" | "on_loading" | "on_delivery" | "credit";

export type CreditTermDays = 15 | 30 | 45;

export type CheckoutPaymentStatus =
  | "not_selected"
  | "pending_seller_approval"
  | "awaiting_payment"
  | "payment_pending_delivery"
  | "credit_allocated"
  | "paid"
  | "due";

export type CheckoutPaymentBadgeVariant =
  "recommended" | "approval" | "credit" | "unavailable";

export interface CheckoutPaymentBadge {
  label: string;
  variant: CheckoutPaymentBadgeVariant;
}

export interface CheckoutPaymentOption {
  id: CheckoutPaymentMethodId;
  title: string;
  description: string;
  timing: string;
  benefits: string[];
  badge?: CheckoutPaymentBadge;
  icon: "wallet" | "package" | "truck" | "calendar";
  requiresSellerApprovalNote?: boolean;
  isCredit: boolean;
}

export interface CheckoutCreditProfile {
  approved: boolean;
  availableCredit: number;
  creditLimit: number;
  creditUsed: number;
}

export type AdaptiveTimelineStepId =
  | "po_created"
  | "seller_review"
  | "seller_approved"
  | "proforma"
  | "advance_payment"
  | "payment_before_loading"
  | "credit_allocated"
  | "tax_invoice"
  | "loading"
  | "shipment"
  | "delivery"
  | "payment_collection"
  | "payment_due";

export interface AdaptiveTimelineStep {
  id: AdaptiveTimelineStepId;
  label: string;
}
