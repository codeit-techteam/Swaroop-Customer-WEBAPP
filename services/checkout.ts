import { isAxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import type { PaymentMethodId } from "@/types/product-details";

export type CheckoutQuote = {
  quoteId: string;
  productId: string;
  offerId: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  baseAmount: string;
  discountAmount: string;
  freightAmount: string;
  taxAmount: string;
  taxRate: string;
  platformFee: string;
  insuranceAmount: string;
  insuranceIncluded: boolean;
  totalAmount: string;
  currency: string;
  paymentOption: string;
  paymentLabel: string;
  expiresAt: string;
  pricingVersion: string;
  shippingAddressId?: string | null;
  product: { id: string; code: string; name: string; packaging: string | null };
  grade: { displayName?: string; name?: string; code?: string } | null;
};

export type CheckoutAddress = {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export type CheckoutPaymentOption = {
  paymentOption: string;
  title: string;
  description: string;
  benefitLabel: string;
  eligible: boolean;
  discountBps: number;
};

export function toBackendPaymentOption(id: PaymentMethodId): string {
  switch (id) {
    case "on_loading":
      return "ON_LOADING";
    case "on_delivery":
      return "ON_DELIVERY";
    case "credit_15":
      return "CREDIT_15";
    case "credit_30":
      return "CREDIT_30";
    default:
      return "ADVANCE";
  }
}

export function checkoutErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ code?: string; message?: string; details?: { latestQuote?: CheckoutQuote } }>(error)) {
    const payload = error.response?.data;
    if (payload?.code === "QUOTE_CHANGED") {
      return "Price Updated. Availability or pricing has changed. Please review the latest quote.";
    }
    if (payload?.code === "QUOTE_EXPIRED") {
      return "This quote has expired. Please review the latest price.";
    }
    if (payload?.code === "CREDIT_NOT_ELIGIBLE") {
      return "PetroTrade Credit is not available for this account.";
    }
    if (payload?.code === "CREDIT_LIMIT_EXCEEDED") {
      return "Requested amount exceeds your available PetroTrade credit.";
    }
    if (payload?.code === "NO_MATCHING_SELLER") {
      return "No seller can currently fulfil this quantity.";
    }
    if (typeof payload?.message === "string" && payload.message) {
      return payload.message;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function checkoutLatestQuote(error: unknown): CheckoutQuote | null {
  if (isAxiosError<{ details?: { latestQuote?: CheckoutQuote } }>(error)) {
    return error.response?.data?.details?.latestQuote ?? null;
  }
  return null;
}

export async function createCustomerQuote(input: {
  productId: string;
  offerId?: string;
  quantity: number;
  paymentOption: string;
  shippingAddressId?: string;
}): Promise<CheckoutQuote> {
  const payload = await apiClient.post<Envelope<CheckoutQuote>>(
    "/customer/checkout/quote",
    input,
  );
  return payload.data;
}

export async function fetchCustomerQuote(quoteId: string): Promise<CheckoutQuote> {
  const payload = await apiClient.get<Envelope<CheckoutQuote>>(
    `/customer/checkout/quotes/${quoteId}`,
  );
  return payload.data;
}

export async function fetchCustomerCheckoutAddresses(): Promise<CheckoutAddress[]> {
  const payload = await apiClient.get<Envelope<CheckoutAddress[]>>(
    "/customer/checkout/addresses",
  );
  return payload.data ?? [];
}

export async function fetchCustomerPaymentOptions(amount?: number): Promise<{
  options: CheckoutPaymentOption[];
  credit: { eligible: boolean; approvedLimit: string; availableLimit: string };
}> {
  const payload = await apiClient.get<
    Envelope<{
      options: CheckoutPaymentOption[];
      credit: { eligible: boolean; approvedLimit: string; availableLimit: string };
    }>
  >("/customer/checkout/payment-options", {
    params: amount != null ? { amount } : undefined,
  });
  return payload.data;
}

export async function placeCustomerPurchaseRequest(input: {
  quoteId: string;
  shippingAddressId?: string;
  idempotencyKey: string;
}) {
  const payload = await apiClient.post<
    Envelope<{
      purchaseRequests: Array<{
        id: string;
        referenceNumber: string;
        status: string;
        responseDeadline?: string | null;
      }>;
    }>
  >("/customer/purchase-requests", input);
  const first = payload.data.purchaseRequests?.[0];
  if (!first) throw new Error("Purchase request was not created");
  return first;
}
