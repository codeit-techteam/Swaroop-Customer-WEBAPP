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
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
};

export type UpdateAddressInput = Partial<CreateAddressInput>;

/** Same org-scoped list the Customer APP uses (`GET /customer/addresses`). */
export async function fetchCustomerAddresses(): Promise<CheckoutAddress[]> {
  const payload = await apiClient.get<Envelope<CheckoutAddress[]>>(
    "/customer/addresses",
  );
  return payload.data ?? [];
}

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
      ...(input.latitude != null ? { latitude: input.latitude } : {}),
      ...(input.longitude != null ? { longitude: input.longitude } : {}),
      isDefault: input.isDefault ?? false,
    },
  );
  return payload.data;
}

export async function updateCustomerAddress(
  id: string,
  input: UpdateAddressInput,
): Promise<CheckoutAddress> {
  const payload = await apiClient.patch<Envelope<CheckoutAddress>>(
    `/customer/addresses/${id}`,
    {
      ...(input.type ? { type: input.type } : {}),
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.line1 !== undefined ? { line1: input.line1 } : {}),
      ...(input.line2 !== undefined ? { line2: input.line2 || undefined } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.state !== undefined ? { state: input.state } : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(input.postalCode !== undefined
        ? { postalCode: input.postalCode }
        : {}),
      ...(input.landmark !== undefined
        ? { landmark: input.landmark || undefined }
        : {}),
      ...(input.latitude !== undefined
        ? { latitude: input.latitude ?? undefined }
        : {}),
      ...(input.longitude !== undefined
        ? { longitude: input.longitude ?? undefined }
        : {}),
      ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
    },
  );
  return payload.data;
}

export async function setDefaultCustomerAddress(
  id: string,
): Promise<CheckoutAddress> {
  const payload = await apiClient.post<Envelope<CheckoutAddress>>(
    `/customer/addresses/${id}/default`,
  );
  return payload.data;
}

export async function deleteCustomerAddress(id: string): Promise<void> {
  await apiClient.delete(`/customer/addresses/${id}`);
}
