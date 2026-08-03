"use client";

import { create } from "zustand";
import { creditSummaryMock, outstandingPaymentMock } from "@/mock/credit";
import type { CreditSummary, OutstandingPayment } from "@/types/dashboard";

export interface CreditStoreState {
  selectedFacilityId: string | null;
  isLoading: boolean;
  creditSummary: CreditSummary;
  outstanding: OutstandingPayment;
  setSelectedFacilityId: (id: string | null) => void;
}

/**
 * creditStore — mock credit facility summary for dashboard / payments.
 * No API logic in the foundation phase.
 */
export const useCreditStore = create<CreditStoreState>((set) => ({
  selectedFacilityId: null,
  isLoading: false,
  creditSummary: creditSummaryMock,
  outstanding: outstandingPaymentMock,
  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),
}));
