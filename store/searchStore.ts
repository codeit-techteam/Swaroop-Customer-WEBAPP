"use client";

import { create } from "zustand";

export interface SearchStoreState {
  query: string;
  recentSearches: string[];
  isOpen: boolean;
}

const initialState: SearchStoreState = {
  query: "",
  recentSearches: [],
  isOpen: false,
};

/**
 * searchStore — typed initial state only.
 * No API logic in the foundation phase.
 */
export const useSearchStore = create<SearchStoreState>(() => ({
  ...initialState,
}));

export { initialState as searchStoreInitialState };
