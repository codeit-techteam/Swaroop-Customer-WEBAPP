"use client";

import { create } from "zustand";

export type CheckoutPaymentMethod =
  "advance" | "on_loading" | "on_delivery" | "credit_15" | "credit_30";

export interface CheckoutStoreState {
  step: number;
  paymentMethod: CheckoutPaymentMethod | null;
  shippingAddressId: string | null;
  notes: string;
}

const initialState: CheckoutStoreState = {
  step: 0,
  paymentMethod: null,
  shippingAddressId: null,
  notes: "",
};

/**
 * checkoutStore — typed initial state only.
 * No API logic in the foundation phase.
 */
export const useCheckoutStore = create<CheckoutStoreState>(() => ({
  ...initialState,
}));

export { initialState as checkoutStoreInitialState };
