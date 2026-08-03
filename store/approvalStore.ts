"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RejectionInfo } from "@/types/order-journey";
import { DEFAULT_REJECTION } from "@/mock/approval";

const STORAGE_KEY = "petrotrade.approval.v1";

type ApprovalState = {
  lastRejection: RejectionInfo | null;
  isHydrated: boolean;
};

type ApprovalActions = {
  setRejection: (info: RejectionInfo) => void;
  clearRejection: () => void;
  buildDefaultRejection: (
    requestId: string,
    displayId: string,
  ) => RejectionInfo;
  setHydrated: (value: boolean) => void;
};

export type ApprovalStore = ApprovalState & ApprovalActions;

const initialState: ApprovalState = {
  lastRejection: null,
  isHydrated: false,
};

export const useApprovalStore = create<ApprovalStore>()(
  persist(
    (set) => ({
      ...initialState,

      setRejection: (info) => set({ lastRejection: info }),

      clearRejection: () => set({ lastRejection: null }),

      buildDefaultRejection: (requestId, displayId) => ({
        requestId,
        displayId,
        reason: DEFAULT_REJECTION.reason,
        suggestedAction: DEFAULT_REJECTION.suggestedAction,
        rejectedAt: new Date().toISOString(),
      }),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ lastRejection: state.lastRejection }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export { initialState as approvalStoreInitialState };
