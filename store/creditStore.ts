"use client";

import { create } from "zustand";
import {
  fetchCustomerCreditLimit,
  toDashboardCredit,
} from "@/services/credit";
import type { CreditSummary, OutstandingPayment } from "@/types/dashboard";

export interface CreditStoreState {
  selectedFacilityId: string | null;
  isLoading: boolean;
  loadError: string | null;
  creditSummary: CreditSummary;
  outstanding: OutstandingPayment;
  setSelectedFacilityId: (id: string | null) => void;
  fetchFromApi: () => Promise<void>;
}

const emptyCredit: CreditSummary = {
  availableCredit: 0,
  creditLimit: 0,
  currency: "INR",
  availablePercent: 0,
};

const emptyOutstanding: OutstandingPayment = {
  amount: 0,
  currency: "INR",
  invoiceId: "",
  dueLabel: "No invoices due",
};

export const useCreditStore = create<CreditStoreState>((set) => ({
  selectedFacilityId: null,
  isLoading: false,
  loadError: null,
  creditSummary: emptyCredit,
  outstanding: emptyOutstanding,
  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),
  fetchFromApi: async () => {
    set({ isLoading: true, loadError: null });
    try {
      const mapped = toDashboardCredit(await fetchCustomerCreditLimit());
      set({ ...mapped, isLoading: false, loadError: null });
    } catch (error) {
      set({
        creditSummary: emptyCredit,
        outstanding: emptyOutstanding,
        isLoading: false,
        loadError: error instanceof Error ? error.message : "Unable to load credit.",
      });
    }
  },
}));
