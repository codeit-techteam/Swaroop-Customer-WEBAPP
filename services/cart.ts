import apiClient from "@/lib/apiClient";
import type { Envelope } from "@/lib/api-envelope";
import { num } from "@/lib/api-envelope";

export type CartLineItem = {
  id: string;
  productId: string;
  offerId?: string;
  name: string;
  grade: string;
  materialType: string;
  imageUrl: string;
  unitPrice: number;
  quantityMt: number;
  moq: number;
  availableStock: number;
  packaging: string;
  regionLabel: string;
};

export type BackendCartItem = {
  id: string;
  quantity: string | number;
  unit: string;
  unitPrice: string | number;
  currency: string;
  paymentMethod?: string | null;
  priceSnapshotAt?: string;
  lineTotal?: number;
  product: {
    id: string;
    code: string;
    name: string;
    packaging: string | null;
    unit: string;
  };
  grade: {
    id: string;
    code: string;
    name: string;
    displayName: string;
  } | null;
  offer: {
    id: string;
    moq?: string | number | null;
    quantityAvailable?: string | number | null;
    unit?: string;
    price?: string | number;
    deliveryTerms?: string | null;
    region?: string | null;
    packaging?: string | null;
    status?: string;
  };
};

export type BackendCart = {
  id: string;
  status: string;
  itemCount: number;
  subtotal: number;
  currency: string;
  items: BackendCartItem[];
};

export function mapBackendCartItem(item: BackendCartItem): CartLineItem {
  const grade = item.grade?.displayName ?? item.grade?.name ?? item.grade?.code ?? "";
  return {
    id: item.id,
    productId: item.product?.id,
    offerId: item.offer?.id,
    name: item.product?.name ?? grade,
    grade,
    materialType: item.product?.code ?? grade,
    imageUrl: "",
    unitPrice: num(item.unitPrice),
    quantityMt: num(item.quantity, 1),
    moq: num(item.offer?.moq, 1),
    availableStock: num(item.offer?.quantityAvailable, num(item.quantity, 1)),
    packaging: item.product?.packaging ?? item.offer?.packaging ?? "",
    regionLabel: item.offer?.region ?? "Verified Hub",
  };
}

export function mapBackendCartItems(cart: BackendCart | null | undefined): CartLineItem[] {
  return (cart?.items ?? []).map(mapBackendCartItem);
}

export async function fetchCustomerCart(): Promise<BackendCart> {
  const payload = await apiClient.get<Envelope<BackendCart>>("/customer/cart");
  return payload.data;
}

export async function addCustomerCartItem(input: {
  offerId: string;
  quantity: number;
  paymentMethod?: string;
}): Promise<{ cart: BackendCart; item: { id: string } }> {
  const payload = await apiClient.post<
    Envelope<{ cart: BackendCart; item: { id: string } }>
  >("/customer/cart/items", input);
  return payload.data;
}

export async function updateCustomerCartItem(
  itemId: string,
  input: { quantity?: number; paymentMethod?: string },
): Promise<BackendCart> {
  const payload = await apiClient.patch<Envelope<BackendCart>>(
    `/customer/cart/items/${itemId}`,
    input,
  );
  return payload.data;
}

export async function removeCustomerCartItem(itemId: string): Promise<BackendCart> {
  const payload = await apiClient.delete<Envelope<BackendCart>>(
    `/customer/cart/items/${itemId}`,
  );
  return payload.data;
}

export async function clearCustomerCart(): Promise<BackendCart> {
  const payload = await apiClient.delete<Envelope<BackendCart>>("/customer/cart");
  return payload.data;
}
