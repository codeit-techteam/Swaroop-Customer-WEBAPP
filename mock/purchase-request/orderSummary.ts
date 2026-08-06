import type {
  OrderSummaryBreakdown,
  PaymentMethodId,
  SelectedProduct,
} from "@/types/purchase-request";
import { calculatePaymentAmounts } from "./paymentMethods";
import { getShippingAddressById } from "./shippingAddress";

/** GST rate — mirrors SWAROOP `CHECKOUT_GST_RATE`. */
export const PR_GST_RATE = 0.18;

export const PR_PLATFORM_FEE = 0;

export function calculateBaseSubtotal(
  ratePerMt: number,
  quantityMt: number,
): number {
  return Math.round(ratePerMt * quantityMt);
}

export function calculateGst(baseSubtotal: number, freight: number): number {
  return Math.round((baseSubtotal + freight) * PR_GST_RATE);
}

export function calculateTotalBeforePayment(
  baseSubtotal: number,
  freight: number,
  gst: number,
): number {
  return baseSubtotal + freight + gst + PR_PLATFORM_FEE;
}

/**
 * Full order summary — mirrors SWAROOP checkout + payment calculation chain.
 */
export function buildOrderSummary(params: {
  product: SelectedProduct;
  quantityMt: number;
  shippingAddressId: string;
  paymentMethodId: PaymentMethodId;
}): OrderSummaryBreakdown {
  const address = getShippingAddressById(params.shippingAddressId);
  const ratePerMt = params.product.currentPricePerMt;
  const baseSubtotal = calculateBaseSubtotal(ratePerMt, params.quantityMt);
  const freight = address.freightAmount;
  const gst = calculateGst(baseSubtotal, freight);
  const totalBeforePayment = calculateTotalBeforePayment(
    baseSubtotal,
    freight,
    gst,
  );
  const payment = calculatePaymentAmounts(
    totalBeforePayment,
    params.paymentMethodId,
  );

  return {
    baseSubtotal,
    freight,
    freightLabel: "Estimated Freight",
    gst,
    platformFee: PR_PLATFORM_FEE,
    insuranceIncluded: true,
    discount: payment.discount,
    interest: payment.interest,
    interestRate: payment.interestRate,
    totalBeforePayment,
    grandTotal: payment.payableAmount,
    totalQuantityMt: params.quantityMt,
    ratePerMt,
  };
}
