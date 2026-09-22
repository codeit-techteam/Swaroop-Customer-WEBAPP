"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import {
  addCustomerCartItem,
  clearCustomerCart,
  fetchCustomerCart,
  mapBackendCartItems,
  removeCustomerCartItem,
  updateCustomerCartItem,
  type CartLineItem,
} from "@/services/cart";
import { authErrorMessage } from "@/services/auth";

export type { CartLineItem };

export type CartMutationResult = { ok: boolean; message: string };

export interface CartStoreState {
  items: CartLineItem[];
  isOpen: boolean;
  isSyncing: boolean;
  loadError: string | null;
  fetchCart: () => Promise<void>;
  addItem: (
    productId: string,
    quantityMt?: number,
    packaging?: string,
    offerId?: string,
    paymentMethod?: string,
  ) => Promise<CartMutationResult>;
  removeItem: (itemId: string) => Promise<void>;
  setQuantity: (itemId: string, quantityMt: number) => Promise<void>;
  clearCart: () => Promise<void>;
  resetLocalCart: () => void;
  setOpen: (open: boolean) => void;
  itemCount: () => number;
  subtotal: () => number;
}

function resolveOfferId(productId: string, offerId?: string): string | undefined {
  if (offerId) return offerId;
  return useMarketplaceStore
    .getState()
    .products.find((product) => product.id === productId)?.offerId;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,
      loadError: null,

      fetchCart: async () => {
        set({ isSyncing: true });
        try {
          const cart = await fetchCustomerCart();
          set({
            items: mapBackendCartItems(cart),
            isSyncing: false,
            loadError: null,
          });
        } catch (error) {
          set({
            isSyncing: false,
            loadError: authErrorMessage(error, "Unable to load cart"),
          });
        }
      },

      addItem: async (productId, quantityMt, packaging, offerId, paymentMethod) => {
        const resolvedOfferId = resolveOfferId(productId, offerId);
        if (!resolvedOfferId) {
          return {
            ok: false,
            message: "Live pricing is still loading. Please try again.",
          };
        }

        const catalog = useMarketplaceStore
          .getState()
          .products.find((product) => product.id === productId);
        const qty = quantityMt ?? catalog?.moq ?? 1;
        if (catalog && qty < catalog.moq) {
          return { ok: false, message: `Minimum Order Quantity is ${catalog.moq} MT` };
        }

        set({ isSyncing: true });
        try {
          const result = await addCustomerCartItem({
            offerId: resolvedOfferId,
            quantity: qty,
            paymentMethod,
          });
          set({
            items: mapBackendCartItems(result.cart),
            isSyncing: false,
            loadError: null,
          });
          return { ok: true, message: "Added to cart" };
        } catch (error) {
          set({ isSyncing: false });
          return {
            ok: false,
            message: authErrorMessage(error, "Unable to add to cart"),
          };
        } finally {
          void packaging;
        }
      },

      removeItem: async (itemId) => {
        const previous = get().items;
        set({ items: previous.filter((item) => item.id !== itemId && item.productId !== itemId) });
        const target =
          previous.find((item) => item.id === itemId) ??
          previous.find((item) => item.productId === itemId);
        if (!target) return;
        try {
          const cart = await removeCustomerCartItem(target.id);
          set({ items: mapBackendCartItems(cart) });
        } catch {
          set({ items: previous });
        }
      },

      setQuantity: async (itemId, quantityMt) => {
        const previous = get().items;
        const item =
          previous.find((entry) => entry.id === itemId) ??
          previous.find((entry) => entry.productId === itemId);
        if (!item) return;
        const nextQty = Math.max(item.moq, Math.round(quantityMt));
        set({
          items: previous.map((entry) =>
            entry.id === item.id ? { ...entry, quantityMt: nextQty } : entry,
          ),
        });
        try {
          const cart = await updateCustomerCartItem(item.id, { quantity: nextQty });
          set({ items: mapBackendCartItems(cart) });
        } catch {
          set({ items: previous });
        }
      },

      clearCart: async () => {
        const previous = get().items;
        set({ items: [] });
        try {
          await clearCustomerCart();
        } catch {
          set({ items: previous });
        }
      },

      resetLocalCart: () => set({ items: [], loadError: null, isSyncing: false }),
      setOpen: (open) => set({ isOpen: open }),
      itemCount: () => get().items.length,
      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantityMt, 0),
    }),
    {
      name: "petrotrade.cart.v1",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
