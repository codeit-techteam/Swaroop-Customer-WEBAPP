"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMarketplaceStore } from "@/store/marketplaceStore";

export interface CartLineItem {
  productId: string;
  name: string;
  grade: string;
  materialType: string;
  imageUrl: string;
  unitPrice: number;
  quantityMt: number;
  moq: number;
  availableStock: number;
  packaging: string;
  /** Blind marketplace — region only, never seller */
  regionLabel: string;
}

export interface CartStoreState {
  items: CartLineItem[];
  isOpen: boolean;
  addItem: (
    productId: string,
    quantityMt?: number,
    packaging?: string,
  ) => { ok: boolean; message: string };
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantityMt: number) => void;
  clearCart: () => void;
  setOpen: (open: boolean) => void;
  itemCount: () => number;
  subtotal: () => number;
}

function resolveProductMeta(productId: string) {
  const catalog = useMarketplaceStore.getState().products.find((p) => p.id === productId);
  if (!catalog) return null;
  return {
    productId: catalog.id,
    name: catalog.name,
    grade: catalog.grade,
    materialType: catalog.materialType,
    imageUrl: "",
    unitPrice: catalog.price,
    moq: catalog.moq,
    availableStock: catalog.stock,
    packaging: "25 KG Bags",
    regionLabel: catalog.warehouseLabel || catalog.origin || "Western India Region",
  };
}

/**
 * cartStore — blind marketplace cart (frontend mock only).
 */
export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (productId, quantityMt, packaging) => {
        const meta = resolveProductMeta(productId);
        if (!meta) {
          return { ok: false, message: "Product not found" };
        }
        const qty = quantityMt ?? meta.moq;
        if (qty < meta.moq) {
          return {
            ok: false,
            message: `Minimum Order Quantity is ${meta.moq} MT`,
          };
        }
        if (qty > meta.availableStock) {
          return {
            ok: false,
            message: `Only ${meta.availableStock} MT available`,
          };
        }

        const existing = get().items.find((i) => i.productId === productId);
        if (existing) {
          const nextQty = Math.min(
            meta.availableStock,
            existing.quantityMt + qty,
          );
          set({
            items: get().items.map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantityMt: nextQty,
                    packaging: packaging ?? i.packaging,
                  }
                : i,
            ),
          });
          return { ok: true, message: "Cart updated" };
        }

        set({
          items: [
            ...get().items,
            {
              ...meta,
              quantityMt: qty,
              packaging: packaging ?? meta.packaging,
            },
          ],
        });
        return { ok: true, message: "Added to cart" };
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      setQuantity: (productId, quantityMt) => {
        const item = get().items.find((i) => i.productId === productId);
        if (!item) return;
        const next = Math.max(
          item.moq,
          Math.min(item.availableStock, Math.round(quantityMt)),
        );
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantityMt: next } : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantityMt, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantityMt, 0),
    }),
    {
      name: "petrotrade.cart.v1",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
