import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import { marketplaceApiBase } from "@/lib/marketplace-api-base";

export type PricingEstimate = {
  binding: boolean;
  currency: string;
  unitPricePerMt: string;
  unitPricePerKg: string;
  quantity: string;
  paymentMethod?: string;
  note?: string;
  amounts?: null;
  exTax?: {
    material: string;
    discount: string;
    freight: string;
    platformFee: string;
    taxable: string;
  };
  tax?: {
    bps: number;
    amount: string;
  };
  inclusiveTotal?: string;
};

export type PricingEstimateInput = {
  offerId: string;
  quantity: number;
  paymentMethod?: string;
};

/**
 * Non-binding landed-cost estimate. Guests hit the public route; authenticated
 * callers use the same marketplaceApiBase() prefix (skipAuth only when public).
 * Does not invent FX — foreign currency returns amounts: null + note.
 */
export async function fetchPricingEstimate(
  input: PricingEstimateInput,
): Promise<PricingEstimate> {
  const base = marketplaceApiBase();
  const payload = await apiClient.post<Envelope<PricingEstimate>>(
    `${base}/pricing/estimate`,
    {
      offerId: input.offerId,
      quantity: String(input.quantity),
      ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
    },
    { skipAuth: base === "/public/marketplace" },
  );
  if (!payload.data) {
    throw new Error("Unable to load price estimate");
  }
  return payload.data;
}
