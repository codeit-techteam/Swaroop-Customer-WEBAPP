"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SHIPMENT_FILTERS } from "@/mock/shipment-tracking";
import { fetchCustomerShipments } from "@/services/logistics";
import { computeShipmentSummary } from "@/lib/shipment-mvp";
import type {
  ShipmentDashboardSummary,
  ShipmentFiltersState,
  ShipmentNotification,
  ShipmentRecord,
  TransportDocument,
} from "@/types/shipment-tracking";

const STORAGE_KEY = "petrotrade.shipment-tracking.v4";

type ShipmentTrackingState = {
  shipments: ShipmentRecord[];
  notifications: ShipmentNotification[];
  filters: ShipmentFiltersState;
  selectedId: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  loadError: string | null;
};

type ShipmentTrackingActions = {
  fetchFromApi: () => Promise<void>;
  setFilters: (partial: Partial<ShipmentFiltersState>) => void;
  resetFilters: () => void;
  setSelectedId: (id: string | null) => void;
  getById: (id: string) => ShipmentRecord | undefined;
  markDocumentDownloaded: (shipmentId: string, documentId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getSummary: () => ShipmentDashboardSummary;
  setHydrated: (value: boolean) => void;
};

export type ShipmentTrackingStore = ShipmentTrackingState &
  ShipmentTrackingActions;

export function filterShipments(
  items: ShipmentRecord[],
  filters: ShipmentFiltersState,
): ShipmentRecord[] {
  let list = [...items];
  const q = filters.search.trim().toLowerCase();

  if (q) {
    list = list.filter((s) => {
      const hay = [
        s.orderNumber,
        s.poNumber,
        s.product,
        s.vehicleNumber,
        s.destination,
        s.grade,
        s.seller,
        s.invoiceNumber,
        s.driverName,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  if (filters.status !== "all") {
    list = list.filter((s) => s.currentStatus === filters.status);
  }

  return list.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export const useShipmentTrackingStore = create<ShipmentTrackingStore>()(
  persist(
    (set, get) => ({
      shipments: [],
      notifications: [],
      filters: { ...DEFAULT_SHIPMENT_FILTERS },
      selectedId: null,
      isHydrated: false,
      isLoading: false,
      loadError: null,

      fetchFromApi: async () => {
        set({ isLoading: true, loadError: null });
        try {
          const shipments = await fetchCustomerShipments();
          set({
            shipments,
            notifications: [],
            isLoading: false,
            isHydrated: true,
            loadError: null,
          });
        } catch (error) {
          set({
            shipments: [],
            notifications: [],
            isLoading: false,
            isHydrated: true,
            loadError:
              error instanceof Error
                ? error.message
                : "Unable to load shipments.",
          });
        }
      },

      setFilters: (partial) =>
        set((state) => ({ filters: { ...state.filters, ...partial } })),

      resetFilters: () => set({ filters: { ...DEFAULT_SHIPMENT_FILTERS } }),

      setSelectedId: (id) => set({ selectedId: id }),

      getById: (id) =>
        get().shipments.find((s) => s.id === id || s.orderNumber === id),

      markDocumentDownloaded: (shipmentId, documentId) =>
        set((state) => ({
          shipments: state.shipments.map((s) => {
            if (s.id !== shipmentId) return s;
            return {
              ...s,
              documents: s.documents.map((d: TransportDocument) =>
                d.id === documentId && d.status !== "pending"
                  ? { ...d, status: "downloaded" }
                  : d,
              ),
            };
          }),
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      getSummary: () => computeShipmentSummary(get().shipments),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        filters: {
          search: state.filters.search,
          status: state.filters.status,
        },
      }),
      onRehydrateStorage: () => (state) => {
        void state?.fetchFromApi();
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<ShipmentTrackingState> | undefined;
        const filters = {
          ...DEFAULT_SHIPMENT_FILTERS,
          ...(p?.filters
            ? {
                search: p.filters.search ?? "",
                status: p.filters.status ?? "all",
              }
            : {}),
        };
        return {
          ...current,
          ...p,
          filters,
        };
      },
    },
  ),
);
