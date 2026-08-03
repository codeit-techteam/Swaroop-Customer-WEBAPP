"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentMethodId } from "@/types/purchase-request";
import { useOrdersStore } from "./ordersStore";

const STORAGE_KEY = "petrotrade.payment-process.v1";

type PaymentProcessState = {
  selectedMethodId: PaymentMethodId;
  proofSubmittedFor: string[];
  verifiedFor: string[];
  isHydrated: boolean;
};

type PaymentProcessActions = {
  setSelectedMethod: (id: PaymentMethodId) => void;
  submitPaymentProof: (orderId: string) => void;
  verifyPayment: (orderId: string) => void;
  isProofSubmitted: (orderId: string) => boolean;
  isVerified: (orderId: string) => boolean;
  setHydrated: (value: boolean) => void;
};

export type PaymentStore = PaymentProcessState & PaymentProcessActions;

const initialState: PaymentProcessState = {
  selectedMethodId: "advance",
  proofSubmittedFor: [],
  verifiedFor: [],
  isHydrated: false,
};

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSelectedMethod: (id) => set({ selectedMethodId: id }),

      submitPaymentProof: (orderId) => {
        set((state) => ({
          proofSubmittedFor: state.proofSubmittedFor.includes(orderId)
            ? state.proofSubmittedFor
            : [...state.proofSubmittedFor, orderId],
        }));
        useOrdersStore.getState().setPaymentStatus(orderId, "submitted");
      },

      verifyPayment: (orderId) => {
        set((state) => ({
          verifiedFor: state.verifiedFor.includes(orderId)
            ? state.verifiedFor
            : [...state.verifiedFor, orderId],
          proofSubmittedFor: state.proofSubmittedFor.includes(orderId)
            ? state.proofSubmittedFor
            : [...state.proofSubmittedFor, orderId],
        }));
        const orders = useOrdersStore.getState();
        orders.setPaymentStatus(orderId, "verified");
        orders.attachDocuments(orderId, {
          receiptNumber: `RCT-${orderId.replace(/^PT-ORD-/, "")}`,
        });
        orders.updateOrderStatus(orderId, "dispatch_ready");
      },

      isProofSubmitted: (orderId) =>
        get().proofSubmittedFor.includes(orderId) ||
        get().verifiedFor.includes(orderId),

      isVerified: (orderId) => get().verifiedFor.includes(orderId),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        selectedMethodId: state.selectedMethodId,
        proofSubmittedFor: state.proofSubmittedFor,
        verifiedFor: state.verifiedFor,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export { initialState as paymentStoreInitialState };
