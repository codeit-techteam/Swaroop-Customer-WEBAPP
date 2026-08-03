"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  computeShipmentSummary,
  DEFAULT_SHIPMENT_FILTERS,
  shipmentNotificationsMock,
  shipmentsCatalogMock,
} from "@/mock/shipment-tracking";
import type {
  ShipmentDashboardSummary,
  ShipmentFiltersState,
  ShipmentNotification,
  ShipmentRecord,
  ShipmentStatus,
  TransportDocument,
} from "@/types/shipment-tracking";

const STORAGE_KEY = "petrotrade.shipment-tracking.v1";

type ShipmentTrackingState = {
  shipments: ShipmentRecord[];
  notifications: ShipmentNotification[];
  filters: ShipmentFiltersState;
  selectedId: string | null;
  isHydrated: boolean;
};

type ShipmentTrackingActions = {
  setFilters: (partial: Partial<ShipmentFiltersState>) => void;
  resetFilters: () => void;
  setSelectedId: (id: string | null) => void;
  getById: (id: string) => ShipmentRecord | undefined;
  markDocumentDownloaded: (shipmentId: string, documentId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  advanceShipmentStatus: (shipmentId: string) => void;
  getSummary: () => ShipmentDashboardSummary;
  setHydrated: (value: boolean) => void;
};

export type ShipmentTrackingStore = ShipmentTrackingState &
  ShipmentTrackingActions;

const STATUS_SEQUENCE: ShipmentStatus[] = [
  "ready_for_dispatch",
  "vehicle_assigned",
  "dispatched",
  "in_transit",
  "out_for_delivery",
  "delivered",
];

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
        s.vehicleNumber,
        s.transportCompany,
        s.driverName,
        s.invoiceNumber,
        s.product,
        s.warehouse,
        s.destination,
        s.grade,
        s.seller,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  if (filters.status !== "all") {
    list = list.filter((s) => s.currentStatus === filters.status);
  }
  if (filters.warehouse !== "all") {
    list = list.filter((s) => s.warehouse === filters.warehouse);
  }
  if (filters.transportCompany !== "all") {
    list = list.filter((s) => s.transportCompany === filters.transportCompany);
  }
  if (filters.seller !== "all") {
    list = list.filter((s) => s.seller === filters.seller);
  }
  if (filters.destinationState !== "all") {
    list = list.filter((s) => s.destinationState === filters.destinationState);
  }
  if (filters.expectedDateFrom) {
    const from = new Date(filters.expectedDateFrom).getTime();
    list = list.filter((s) => new Date(s.eta).getTime() >= from);
  }
  if (filters.expectedDateTo) {
    const to = new Date(filters.expectedDateTo).getTime() + 86400000 - 1;
    list = list.filter((s) => new Date(s.eta).getTime() <= to);
  }

  return list.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function bumpTimeline(shipment: ShipmentRecord): ShipmentRecord {
  if (shipment.currentStatus === "delivered") return shipment;
  if (shipment.currentStatus === "delayed") {
    return {
      ...shipment,
      currentStatus: "in_transit",
      updatedAt: new Date().toISOString(),
    };
  }

  const idx = STATUS_SEQUENCE.indexOf(shipment.currentStatus);
  const next = STATUS_SEQUENCE[Math.min(idx + 1, STATUS_SEQUENCE.length - 1)];
  const nextTimelineIndex = Math.min(
    shipment.timeline.length - 1,
    Math.round((idx + 1) * 1.4) + 2,
  );
  const nextLiveIndex = Math.min(
    shipment.liveProgress.length - 1,
    Math.round(
      ((idx + 1) / (STATUS_SEQUENCE.length - 1)) *
        (shipment.liveProgress.length - 1),
    ),
  );
  const nextRouteIndex = Math.min(
    shipment.route.length - 1,
    Math.round(
      ((idx + 1) / (STATUS_SEQUENCE.length - 1)) * (shipment.route.length - 1),
    ),
  );

  const timeline = shipment.timeline.map((step, i) => ({
    ...step,
    status:
      i < nextTimelineIndex
        ? ("completed" as const)
        : i === nextTimelineIndex
          ? ("current" as const)
          : ("pending" as const),
  }));

  const liveProgress = shipment.liveProgress.map((step, i) => ({
    ...step,
    status:
      i < nextLiveIndex
        ? ("completed" as const)
        : i === nextLiveIndex
          ? ("current" as const)
          : ("pending" as const),
  }));

  const route = shipment.route.map((stop, i) => ({
    ...stop,
    status:
      i < nextRouteIndex
        ? ("completed" as const)
        : i === nextRouteIndex
          ? ("current" as const)
          : ("pending" as const),
  }));

  const progress = Math.round(
    (nextTimelineIndex / (timeline.length - 1)) * 100,
  );
  const remainingFactor = 1 - (idx + 1) / (STATUS_SEQUENCE.length - 1);

  return {
    ...shipment,
    currentStatus: next,
    timeline,
    liveProgress,
    route,
    progress,
    remainingDistanceKm: Math.round(
      shipment.remainingDistanceKm * remainingFactor,
    ),
    remainingHours: Math.round(shipment.remainingHours * remainingFactor),
    currentCity: route[nextRouteIndex]?.city ?? shipment.currentCity,
    updatedAt: new Date().toISOString(),
    dispatchDate:
      shipment.dispatchDate ??
      (next === "dispatched" || idx >= 2
        ? new Date().toISOString()
        : shipment.dispatchDate),
  };
}

export const useShipmentTrackingStore = create<ShipmentTrackingStore>()(
  persist(
    (set, get) => ({
      shipments: shipmentsCatalogMock,
      notifications: shipmentNotificationsMock,
      filters: { ...DEFAULT_SHIPMENT_FILTERS },
      selectedId: null,
      isHydrated: false,

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

      advanceShipmentStatus: (shipmentId) =>
        set((state) => ({
          shipments: state.shipments.map((s) =>
            s.id === shipmentId ? bumpTimeline(s) : s,
          ),
        })),

      getSummary: () => computeShipmentSummary(get().shipments),

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        shipments: state.shipments,
        notifications: state.notifications,
        filters: state.filters,
        selectedId: state.selectedId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
