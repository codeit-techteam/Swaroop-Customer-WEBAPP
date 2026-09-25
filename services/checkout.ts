import { isAxiosError } from "axios";
import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import { commerceErrorCopy, isNetworkError } from "@/lib/commerce-errors";
import { ROUTES } from "@/constants";
import type { PaymentMethodId } from "@/types/product-details";

export type PlatformPaymentOptionCode =
  | "ADVANCE"
  | "ON_LOADING"
  | "ON_DELIVERY"
  | "CREDIT"
  | "CREDIT_15"
  | "CREDIT_30";

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
  billingAddressId?: string | null;
  product: { id: string; code: string; name: string; packaging: string | null };
  grade: { displayName?: string; name?: string; code?: string } | null;
};

export type CheckoutAddress = {
  id: string;
  type?: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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

export type CartPriceChange = {
  cartItemId: string;
  productId: string;
  productName: string;
  gradeName: string | null;
  oldUnitPrice: number;
  newUnitPrice: number;
  quantity: number;
  unit: string;
};

export type CartQuoteIssue = {
  cartItemId: string;
  code: string;
  message: string;
  currentUnitPrice?: number;
};

export type CartQuoteResult = {
  status: "OK" | "PRICE_CHANGED" | "INVALID";
  valid: boolean;
  issues: CartQuoteIssue[];
  changes: CartPriceChange[];
  quote: CheckoutQuote | null;
  quotes: CheckoutQuote[];
  shippingAddressId: string | null;
  billingAddressId: string | null;
};

export type PlacePurchaseRequestResult = {
  id: string;
  referenceNumber: string;
  status: string;
  responseDeadline?: string | null;
};

type CheckoutErrorBody = {
  success?: boolean;
  code?: string;
  message?: string;
  details?: { latestQuote?: CheckoutQuote };
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

export function checkoutErrorCode(error: unknown): string | null {
  if (isNetworkError(error)) return "NETWORK_ERROR";
  if (isAxiosError<CheckoutErrorBody>(error)) {
    const code = error.response?.data?.code;
    if (typeof code === "string" && code) return code;
    if (error.response?.status === 401) return "UNAUTHORIZED";
    if (!error.response) return "NETWORK_ERROR";
  }
  return null;
}

export function checkoutErrorMessage(error: unknown, fallback: string): string {
  const code = checkoutErrorCode(error);
  if (code) return commerceErrorCopy(code, fallback).message;
  if (isAxiosError<CheckoutErrorBody>(error)) {
    const payload = error.response?.data;
    if (typeof payload?.message === "string" && payload.message) {
      return payload.message;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function checkoutLatestQuote(error: unknown): CheckoutQuote | null {
  if (isAxiosError<CheckoutErrorBody>(error)) {
    return error.response?.data?.details?.latestQuote ?? null;
  }
  return null;
}

export function uniqueQuoteIds(
  primary?: string | null,
  extra?: string | null,
): string[] {
  const ids = [primary, ...(extra ? extra.split(",") : [])].filter(
    (value): value is string => Boolean(value && value.trim()),
  );
  return [...new Set(ids.map((value) => value.trim()))];
}

export function checkoutHref(quoteIds: string[]): string {
  const ids = uniqueQuoteIds(quoteIds[0], quoteIds.slice(1).join(","));
  if (ids.length === 0) return ROUTES.checkout;
  const params = new URLSearchParams({
    quoteId: ids[0],
    quoteIds: ids.join(","),
  });
  return `${ROUTES.checkout}?${params.toString()}`;
}

export async function createCustomerQuote(input: {
  productId: string;
  offerId?: string;
  quantity: number;
  paymentOption: string;
  shippingAddressId?: string;
  billingAddressId?: string;
}): Promise<CheckoutQuote> {
  const payload = await apiClient.post<Envelope<CheckoutQuote>>(
    "/customer/checkout/quote",
    input,
  );
  return payload.data;
}

export async function fetchCustomerQuote(
  quoteId: string,
): Promise<CheckoutQuote> {
  const payload = await apiClient.get<Envelope<CheckoutQuote>>(
    `/customer/checkout/quotes/${quoteId}`,
  );
  return payload.data;
}

export async function quoteCartForCheckout(input?: {
  paymentOption?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  expectedPrices?: Array<{ cartItemId: string; unitPrice: number }>;
}): Promise<CartQuoteResult> {
  const payload = await apiClient.post<Envelope<CartQuoteResult>>(
    "/customer/checkout/quote-from-cart",
    input ?? {},
  );
  const data = payload.data;
  return {
    ...data,
    quotes: data.quotes?.length ? data.quotes : data.quote ? [data.quote] : [],
    issues: data.issues ?? [],
    changes: data.changes ?? [],
  };
}

export async function fetchCustomerCheckoutAddresses(): Promise<
  CheckoutAddress[]
> {
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
      credit: {
        eligible: boolean;
        approvedLimit: string;
        availableLimit: string;
      };
    }>
  >("/customer/checkout/payment-options", {
    params: amount != null ? { amount } : undefined,
  });
  return payload.data;
}

export async function placeCustomerPurchaseRequest(input: {
  quoteId: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  idempotencyKey: string;
  notes?: string;
}): Promise<PlacePurchaseRequestResult> {
  const payload = await apiClient.post<
    Envelope<{
      purchaseRequests: PlacePurchaseRequestResult[];
      idempotent?: boolean;
    }>
  >("/customer/purchase-requests", input);
  const first = payload.data.purchaseRequests?.[0];
  if (!first) throw new Error("Purchase request was not created");
  return first;
}
