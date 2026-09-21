"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMarketplaceStore } from "@/store/marketplaceStore";
import type { MarketplaceProduct } from "@/types/marketplace";

const MAX_COMPARE = 4;

interface CompareStoreState {
  ids: string[];
  toggle: (productId: string) => { ok: boolean; message?: string };
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
  getItems: () => MarketplaceProduct[];
}

export const useCompareStore = create<CompareStoreState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const { ids } = get();
        if (ids.includes(productId)) {
          set({ ids: ids.filter((id) => id !== productId) });
          return { ok: true };
        }
        if (ids.length >= MAX_COMPARE) {
          return {
            ok: false,
            message: `You can compare up to ${MAX_COMPARE} grades`,
          };
        }
        set({ ids: [...ids, productId] });
        return { ok: true };
      },
      has: (productId) => get().ids.includes(productId),
      remove: (productId) =>
        set({ ids: get().ids.filter((id) => id !== productId) }),
      clear: () => set({ ids: [] }),
      getItems: () =>
        get()
          .ids.map((id) =>
            useMarketplaceStore.getState().products.find((p) => p.id === id),
          )
          .filter((p): p is MarketplaceProduct => Boolean(p)),
    }),
    { name: "petrotrade.compare.v1" },
  ),
);
