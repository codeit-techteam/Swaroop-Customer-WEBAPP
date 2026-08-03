"use client";

import { create } from "zustand";

export interface CartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartStoreState = {
  items: [],
  isOpen: false,
};

/**
 * cartStore — typed initial state only.
 * No API logic in the foundation phase.
 */
export const useCartStore = create<CartStoreState>(() => ({
  ...initialState,
}));

export { initialState as cartStoreInitialState };
