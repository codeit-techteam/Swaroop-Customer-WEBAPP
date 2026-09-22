import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import type { CheckoutAddress } from "@/services/checkout";

export type CreateAddressInput = {
  type?: "SHIPPING" | "BILLING";
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode: string;
  landmark?: string;
  isDefault?: boolean;
};

export async function createCustomerAddress(
  input: CreateAddressInput,
): Promise<CheckoutAddress> {
  const payload = await apiClient.post<Envelope<CheckoutAddress>>(
    "/customer/addresses",
    {
      type: input.type ?? "SHIPPING",
      label: input.label,
      line1: input.line1,
      line2: input.line2 || undefined,
      city: input.city,
      state: input.state,
      country: input.country ?? "IN",
      postalCode: input.postalCode,
      landmark: input.landmark || undefined,
      isDefault: input.isDefault ?? false,
    },
  );
  return payload.data;
}
