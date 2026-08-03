"use client";

import { create } from "zustand";

export interface SupportStoreState {
  selectedTicketId: string | null;
  isLoading: boolean;
}

const initialState: SupportStoreState = {
  selectedTicketId: null,
  isLoading: false,
};

/**
 * supportStore — typed initial state only.
 * No API logic in the foundation phase.
 */
export const useSupportStore = create<SupportStoreState>(() => ({
  ...initialState,
}));

export { initialState as supportStoreInitialState };
