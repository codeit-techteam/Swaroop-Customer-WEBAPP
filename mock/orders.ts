import type { SubmittedPurchaseRequest } from "@/types/purchase-request";
import type { CustomerOrder, OrderPaymentStatus } from "@/types/order-journey";
import { getShippingAddressById } from "@/mock/purchase-request/shippingAddress";
import { creditEligibilityMock } from "@/mock/purchase-request/creditEligibility";

function initialPaymentStatus(
  methodId: SubmittedPurchaseRequest["paymentMethodId"],
): OrderPaymentStatus {
  switch (methodId) {
    case "advance":
      return "pending";
    case "on_loading":
      return "not_required_yet";
    case "on_delivery":
      return "not_required_yet";
    case "credit_15":
    case "credit_30":
      return "outstanding";
    default:
      return "pending";
  }
}

function creditDueDate(
  methodId: SubmittedPurchaseRequest["paymentMethodId"],
): string | null {
  if (methodId !== "credit_15" && methodId !== "credit_30") return null;
  const days = methodId === "credit_30" ? 30 : 15;
  const date = new Date();
  date.setDate(date.getDate() + days + 5);
  return date.toISOString().slice(0, 10);
}

/**
 * Build customer order from approved purchase request —
 * mirrors SWAROOP `buildOrderFromCheckout` payable amount rules.
 */
export function buildOrderFromPurchaseRequest(
  submitted: SubmittedPurchaseRequest,
): CustomerOrder {
  const orderId =
    submitted.orderId ?? `PT-ORD-${submitted.displayId.replace(/^PR-?/i, "")}`;
  const poNumber =
    submitted.poNumber ?? `PO-${orderId.replace(/^PT-ORD-/, "")}`;
  const address = getShippingAddressById(submitted.form.shippingAddressId);
  const now = new Date().toISOString();
  const isCredit =
    submitted.paymentMethodId === "credit_15" ||
    submitted.paymentMethodId === "credit_30";

  return {
    id: orderId,
    poNumber,
    purchaseRequestId: submitted.id,
    purchaseRequestDisplayId: submitted.displayId,
    productId: submitted.product.id,
    productName: submitted.product.name,
    grade: submitted.product.grade,
    quantityMt: submitted.form.quantityMt,
    warehouse: submitted.product.warehouse,
    destination: `${address.line1}, ${address.cityShort}`,
    paymentMethodId: submitted.paymentMethodId,
    paymentMethodTitle: submitted.paymentMethodTitle,
    amount: submitted.summary.grandTotal,
    baseAmount: submitted.summary.totalBeforePayment,
    paymentStatus: initialPaymentStatus(submitted.paymentMethodId),
    orderStatus: "order_created",
    expectedDispatch: submitted.expectedDispatch,
    eta: address.etaLabel,
    invoiceNumber: null,
    receiptNumber: null,
    createdAt: now,
    updatedAt: now,
    discount: submitted.summary.discount,
    interestAmount: submitted.summary.interest,
    interestRate: submitted.summary.interestRate,
    creditLimit: isCredit ? creditEligibilityMock.creditLimit : null,
    availableCredit: isCredit ? creditEligibilityMock.availableCredit : null,
    creditUsed: isCredit ? submitted.summary.grandTotal : null,
    dueDate: creditDueDate(submitted.paymentMethodId),
    productImageUrl: submitted.product.imageUrl,
    packaging: submitted.form.packaging,
    gstNumber: submitted.form.gstNumber,
  };
}

export const ordersMock: CustomerOrder[] = [];
