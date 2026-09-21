"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PurchaseRequestTrackingItem } from "@/types/purchase-request-tracking";
import type { SubmittedPurchaseRequest } from "@/types/purchase-request";
import { mapSubmittedToTrackingItem } from "@/mock/purchase-request/trackingRequests";
import {
  cancelCustomerPurchaseRequest,
  fetchCustomerPurchaseRequests,
} from "@/services/purchase-requests";

const STORAGE_KEY = "petrotrade.pr-tracking.v2";

type TrackingState = {
  items: PurchaseRequestTrackingItem[];
  isHydrated: boolean;
  isLoading: boolean;
  loadError: string | null;
};

type TrackingActions = {
  fetchFromApi: () => Promise<void>;
  upsertFromSubmitted: (submitted: SubmittedPurchaseRequest) => void;
  cancelRequest: (id: string) => Promise<void>;
  withdrawRequest: (id: string) => Promise<void>;
  refreshPendingTimers: () => void;
  getById: (id: string) => PurchaseRequestTrackingItem | undefined;
  setHydrated: (value: boolean) => void;
};

export type PurchaseRequestTrackingStore = TrackingState & TrackingActions;

export const usePurchaseRequestTrackingStore =
  create<PurchaseRequestTrackingStore>()(
    persist(
      (set, get) => ({
        items: [],
        isHydrated: false,
        isLoading: false,
        loadError: null,

        fetchFromApi: async () => {
          set({ isLoading: true, loadError: null });
          try {
            const items = await fetchCustomerPurchaseRequests();
            set({ items, isLoading: false, isHydrated: true, loadError: null });
          } catch (error) {
            set({
              items: [],
              isLoading: false,
              isHydrated: true,
              loadError:
                error instanceof Error ? error.message : "Unable to load purchase requests.",
            });
          }
        },

        upsertFromSubmitted: (submitted) => {
          const mapped = mapSubmittedToTrackingItem(submitted);
          set((state) => {
            const without = state.items.filter(
              (item) =>
                item.id !== mapped.id && item.displayId !== mapped.displayId,
            );
            return { items: [mapped, ...without] };
          });
        },

        cancelRequest: async (id) => {
          await cancelCustomerPurchaseRequest(id);
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id && item.canCancel
                ? {
                    ...item,
                    status: "cancelled",
                    requestStatus: "withdrawn",
                    canCancel: false,
                    secondsRemaining: null,
                  }
                : item,
            ),
          }));
        },

        withdrawRequest: async (id) => {
          await get().cancelRequest(id);
        },

        refreshPendingTimers: () => {
          set((state) => ({
            items: state.items.map((item) => {
              if (
                item.secondsRemaining == null ||
                item.status === "expired" ||
                item.status === "approved" ||
                item.status === "rejected"
              ) {
                return item;
              }
              const next = Math.max(0, item.secondsRemaining - 1);
              if (next === 0 && item.requestStatus === "pending_approval") {
                return {
                  ...item,
                  secondsRemaining: 0,
                  status: "expired",
                  requestStatus: "expired",
                  expiredAt: new Date().toISOString(),
                  canCancel: false,
                };
              }
              return { ...item, secondsRemaining: next };
            }),
          }));
        },

        getById: (id) => get().items.find((item) => item.id === id),

        setHydrated: (value) => set({ isHydrated: value }),
      }),
      {
        name: STORAGE_KEY,
        partialize: () => ({ items: [] as PurchaseRequestTrackingItem[] }),
        onRehydrateStorage: () => (state) => {
          void state?.fetchFromApi();
        },
      },
    ),
  );
