"use client";

import { create } from "zustand";

export interface ProfileStoreState {
  isEditing: boolean;
  isLoading: boolean;
}

const initialState: ProfileStoreState = {
  isEditing: false,
  isLoading: false,
};

/**
 * profileStore — typed initial state only.
 * No API logic in the foundation phase.
 */
export const useProfileStore = create<ProfileStoreState>(() => ({
  ...initialState,
}));

export { initialState as profileStoreInitialState };
