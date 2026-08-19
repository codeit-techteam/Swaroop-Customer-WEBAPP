"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildMvpTimeline } from "@/mock/shipment-tracking";
import {
  DEFAULT_SHIPMENT_FILTERS,
  shipmentNotificationsMock,
  shipmentsCatalogMock,
} from "@/mock/shipment-tracking";
import {
  computeShipmentSummary,
  shipmentProgressPercent,
  shipmentStatusTimelineIndex,
} from "@/lib/shipment-mvp";
import type {
  ShipmentDashboardSummary,
  ShipmentFiltersState,
  ShipmentNotification,
  ShipmentRecord,
  ShipmentStatus,
  TransportDocument,
} from "@/types/shipment-tracking";

const STORAGE_KEY = "petrotrade.shipment-tracking.v3";

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

function bumpTimeline(shipment: ShipmentRecord): ShipmentRecord {
  if (shipment.currentStatus === "delivered") return shipment;

  const idx = STATUS_SEQUENCE.indexOf(shipment.currentStatus);
  const next = STATUS_SEQUENCE[Math.min(idx + 1, STATUS_SEQUENCE.length - 1)];
  const dispatchDate =
    shipment.dispatchDate ??
    (next === "dispatched" || idx >= 0
      ? next === "dispatched" ||
        next === "in_transit" ||
        next === "out_for_delivery" ||
        next === "delivered"
        ? new Date().toISOString()
        : shipment.dispatchDate
      : shipment.dispatchDate);

  const timeline = buildMvpTimeline(
    next,
    shipment.createdAt,
    dispatchDate ?? shipment.dispatchDate,
  );
  const progress = shipmentProgressPercent(next);
  const routeIndex = Math.min(
    shipment.route.length - 1,
    Math.round(
      (shipmentStatusTimelineIndex(next) / 5) * (shipment.route.length - 1),
    ),
  );
  const route = shipment.route.map((stop, i) => ({
    ...stop,
    status:
      i < routeIndex
        ? ("completed" as const)
        : i === routeIndex
          ? ("current" as const)
          : ("pending" as const),
  }));

  return {
    ...shipment,
    currentStatus: next,
    timeline,
    route,
    progress,
    remainingDistanceKm:
      next === "delivered"
        ? 0
        : Math.round(shipment.remainingDistanceKm * (1 - (idx + 1) / 4)),
    remainingHours:
      next === "delivered"
        ? 0
        : Math.round(shipment.remainingHours * (1 - (idx + 1) / 4)),
    currentCity: route[routeIndex]?.city ?? shipment.currentCity,
    updatedAt: new Date().toISOString(),
    dispatchDate: dispatchDate ?? shipment.dispatchDate,
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
        filters: {
          search: state.filters.search,
          status: state.filters.status,
        },
        selectedId: state.selectedId,
      }),
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
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
