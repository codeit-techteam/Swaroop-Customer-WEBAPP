import type {
  PurchaseRequestFormData,
  SelectedProduct,
  ValidationStepId,
  ValidationTimelineStep,
} from "@/types/purchase-request";
import { getProductById } from "@/mock/products";
import { DEFAULT_SHIPPING_ADDRESS_ID } from "./shippingAddress";
import { DEFAULT_BILLING_ADDRESS_ID } from "./billingAddress";

/** 15-minute seller / price-lock window — mirrors SWAROOP `PRICE_LOCK_DURATION_SECONDS`. */
export const PRICE_LOCK_DURATION_SECONDS = 15 * 60;

export const PACKAGING_OPTIONS = [
  "25 KG Bags",
  "50 KG Bags",
  "Jumbo Bags (1 MT)",
  "Bulk Container",
] as const;

export type PackagingOption = (typeof PACKAGING_OPTIONS)[number];

/** Format packaging display — mirrors SWAROOP `formatCheckoutPackaging`. */
export function formatPackagingDisplay(
  packaging: string,
  quantityMt: number,
): string {
  if (quantityMt >= 10 && /bag/i.test(packaging)) {
    return "Bulk Container";
  }
  return packaging;
}

export function createDefaultFormData(
  moq = 25,
  packaging: string = PACKAGING_OPTIONS[0],
): PurchaseRequestFormData {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  return {
    quantityMt: moq,
    packaging,
    deliveryLocationId: DEFAULT_SHIPPING_ADDRESS_ID,
    expectedDeliveryDate: deliveryDate.toISOString().slice(0, 10),
    remarks: "",
    gstNumber: "27AABCP1234D1Z5",
    purchaseOrderReference: "",
    shippingAddressId: DEFAULT_SHIPPING_ADDRESS_ID,
    billingAddressId: DEFAULT_BILLING_ADDRESS_ID,
    sameAsShipping: true,
  };
}

export function mapProductToSelected(
  productId: string,
  overrides?: {
    currentPricePerMt?: number;
    warehouse?: string;
    manufacturer?: string;
    moq?: number;
  },
): SelectedProduct | null {
  const product = getProductById(productId);
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    grade: product.grade,
    manufacturer: overrides?.manufacturer ?? product.brandName,
    warehouse: overrides?.warehouse ?? product.warehouseLabel,
    warehouseRegion: product.origin,
    availableStock: product.stock,
    moq: overrides?.moq ?? product.moq,
    quantityIncrement: 25,
    currentPricePerMt: overrides?.currentPricePerMt ?? product.price,
    packaging: PACKAGING_OPTIONS[0],
    imageUrl: product.image,
    materialType: product.materialType,
    eta: product.eta,
  };
}

/** Default featured product when create page opens without productId. */
export const DEFAULT_PR_PRODUCT_ID = "mkt-pp-h110ma";

export const VALIDATION_STEP_SEQUENCE: ValidationStepId[] = [
  "order_received",
  "payment_verified",
  "procurement_matching",
  "price_reconfirmation",
  "inventory_allocation",
  "seller_acceptance",
  "purchase_order_generation",
];

export const VALIDATION_STEP_TITLES: Record<ValidationStepId, string> = {
  order_received: "Purchase Request Submitted",
  payment_verified: "Payment Verified",
  procurement_matching: "Under Review",
  price_reconfirmation: "Price Reconfirmation",
  inventory_allocation: "Inventory Allocation",
  seller_acceptance: "Approval Pending",
  purchase_order_generation: "Purchase Order Generation",
};

export const VALIDATION_STEP_SUBTITLES: Record<ValidationStepId, string> = {
  order_received: "Request received by PetroTrade",
  payment_verified: "Credit facility limit checked",
  procurement_matching: "Identified optimal sourcing node",
  price_reconfirmation: "Validating current market index",
  inventory_allocation: "Final stock blocking at hub",
  seller_acceptance: "Blind verification complete",
  purchase_order_generation: "Digitally signed document",
};

export function createInitialValidationTimeline(): {
  currentStep: ValidationStepId;
  completedSteps: ValidationStepId[];
} {
  return {
    currentStep: "price_reconfirmation",
    completedSteps: [
      "order_received",
      "payment_verified",
      "procurement_matching",
    ],
  };
}

export function buildValidationTimelineSteps(
  currentStep: ValidationStepId,
  completedSteps: ValidationStepId[],
): ValidationTimelineStep[] {
  const completed = new Set(completedSteps);

  return VALIDATION_STEP_SEQUENCE.map((stepId) => {
    let status: ValidationTimelineStep["status"] = "pending";
    if (completed.has(stepId)) {
      status = "completed";
    } else if (stepId === currentStep) {
      status = "current";
    }

    return {
      id: stepId,
      title: VALIDATION_STEP_TITLES[stepId],
      subtitle: VALIDATION_STEP_SUBTITLES[stepId],
      status,
    };
  });
}

export function generatePurchaseRequestId(): string {
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `PR-${suffix}`;
}

export function generateOrderId(prDisplayId: string): string {
  const numeric = prDisplayId.replace(/\D/g, "") || "10000";
  return `PT-ORD-${numeric}`;
}

export function generatePoNumber(orderId: string): string {
  const suffix = orderId.replace(/\D/g, "").slice(-5) || "10000";
  return `PT-PO-2026-${suffix}`;
}

export const CHECKOUT_PAYMENT_PROTOCOL = {
  title: "Payment Protocol",
  bodyPrefix:
    "A Proforma Invoice (PI) will be instantly generated upon order placement. Payment must be completed via",
  highlights: ["RTGS", "NEFT", "24 Hours"] as const,
  bodySuffix: "to lock the quoted market price.",
} as const;

export const ORDER_CONFIRMATION_COPY = {
  submittedTitle: "Purchase Request Submitted Successfully",
  submittedChip: "Pending Confirmation",
  priceLockHeading: "Market Price Locked",
  priceLockSubtitle:
    "Price expires after countdown. Secured inventory hold active.",
  priceLockExpired: "Expired",
  statusMessage: "Waiting for Verified Supplier Confirmation",
  statusExpected: "Expected: Within 15 Minutes",
  approvedTitle: "Order Confirmed",
  approvedSubtitle:
    "Your purchase request has been approved and an order has been generated.",
  poConfirmed: "Your order has been successfully confirmed.",
} as const;
