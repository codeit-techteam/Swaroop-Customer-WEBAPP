"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  OrdersCatalogItem,
  OrdersDisplayStatus,
  OrdersSortBy,
} from "@/types/orders-catalog";
import { ordersCatalogMock } from "@/mock/orders-catalog";
import type { CustomerOrder } from "@/types/order-journey";

const STORAGE_KEY = "petrotrade.orders-catalog.v2";

export type OrdersCatalogFilters = {
  search: string;
  status: OrdersDisplayStatus | "all";
  warehouse: string;
  seller: string;
  paymentType: string;
  deliveryType: string;
  sortBy: OrdersSortBy;
  dateFrom: string;
  dateTo: string;
};

type State = {
  items: OrdersCatalogItem[];
  filters: OrdersCatalogFilters;
  page: number;
  pageSize: number;
  isHydrated: boolean;
};

type Actions = {
  setFilters: (patch: Partial<OrdersCatalogFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  getById: (id: string) => OrdersCatalogItem | undefined;
  upsertFromCustomerOrder: (order: CustomerOrder) => void;
  setHydrated: (value: boolean) => void;
};

const defaultFilters: OrdersCatalogFilters = {
  search: "",
  status: "all",
  warehouse: "all",
  seller: "all",
  paymentType: "all",
  deliveryType: "all",
  sortBy: "newest",
  dateFrom: "",
  dateTo: "",
};

function mapCustomerToCatalog(order: CustomerOrder): OrdersCatalogItem {
  const statusMap: Record<string, OrdersDisplayStatus> = {
    order_created: "processing",
    payment_pending: "processing",
    payment_verified: "processing",
    dispatch_ready: "ready",
    dispatched: "in_transit",
    in_transit: "in_transit",
    near_destination: "in_transit",
    delivered: "delivered",
  };
  const displayStatus = statusMap[order.orderStatus] ?? "processing";
  return {
    id: order.id,
    poNumber: order.poNumber,
    productId: order.productId,
    productName: order.productName,
    grade: order.grade,
    productImageUrl: order.productImageUrl,
    sellerName: "Supply Assigned",
    warehouse: order.warehouse,
    quantityMt: order.quantityMt,
    pricePerMt: Math.round(order.baseAmount / Math.max(order.quantityMt, 1)),
    gstAmount: Math.round(order.baseAmount * 0.18),
    freightAmount: 14000,
    insuranceAmount: 10000,
    grandTotal: order.amount,
    paymentMethodId: order.paymentMethodId,
    paymentMethodTitle: order.paymentMethodTitle,
    paymentStatus:
      order.paymentStatus === "verified"
        ? "verified"
        : order.paymentStatus === "outstanding"
          ? "outstanding"
          : "pending",
    displayStatus,
    progress:
      displayStatus === "delivered"
        ? 100
        : displayStatus === "in_transit"
          ? 80
          : displayStatus === "ready"
            ? 70
            : 40,
    expectedDelivery: order.eta,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    destination: order.destination,
    currentLocation: order.warehouse,
    distanceRemainingKm: null,
    etaLabel: order.eta,
    vehicleNumber: null,
    transporter: null,
    driverName: null,
    driverContact: null,
    loadingSlot: null,
    dispatchDate: order.expectedDispatch,
    packingTeam: null,
    processingPercent: 40,
    estimatedCompletion: null,
    expectedDispatch: order.expectedDispatch,
    deliveredAt: displayStatus === "delivered" ? order.updatedAt : null,
    receiverName: null,
    invoiceNumber: order.invoiceNumber,
    ewayBillNumber: null,
    podId: null,
    cancelledAt: null,
    cancellationReason: null,
    cancelledBy: null,
    refundStatus: null,
    previousPricePerMt: null,
    currentPricePerMt: Math.round(
      order.baseAmount / Math.max(order.quantityMt, 1),
    ),
    availability: "in_stock",
    deliveryType: "road",
    timeline: [
      {
        id: "1",
        title: "Order Created",
        status: "completed",
        at: order.createdAt,
      },
      {
        id: "2",
        title: "Order Confirmed",
        status: "completed",
        at: order.createdAt,
      },
      {
        id: "3",
        title: "PO Generated",
        status: "completed",
        at: order.createdAt,
      },
      {
        id: "4",
        title: "Packed",
        status: displayStatus === "processing" ? "current" : "completed",
        at: null,
      },
      {
        id: "5",
        title: "Dispatched",
        status:
          displayStatus === "ready"
            ? "current"
            : displayStatus === "in_transit" || displayStatus === "delivered"
              ? "completed"
              : "pending",
        at: null,
      },
      {
        id: "6",
        title: "In Transit",
        status:
          displayStatus === "in_transit"
            ? "current"
            : displayStatus === "delivered"
              ? "completed"
              : "pending",
        at: null,
      },
      {
        id: "7",
        title: "Delivered",
        status: displayStatus === "delivered" ? "completed" : "pending",
        at: null,
      },
    ],
  };
}

export const useOrdersCatalogStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: ordersCatalogMock,
      filters: defaultFilters,
      page: 1,
      pageSize: 8,
      isHydrated: false,

      setFilters: (patch) =>
        set((state) => ({
          filters: { ...state.filters, ...patch },
          page: 1,
        })),

      resetFilters: () => set({ filters: defaultFilters, page: 1 }),

      setPage: (page) => set({ page }),

      getById: (id) => get().items.find((item) => item.id === id),

      upsertFromCustomerOrder: (order) => {
        const mapped = mapCustomerToCatalog(order);
        set((state) => ({
          items: [
            mapped,
            ...state.items.filter((item) => item.id !== mapped.id),
          ],
        }));
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function filterSortOrders(
  items: OrdersCatalogItem[],
  filters: OrdersCatalogFilters,
  statusScope?: OrdersDisplayStatus[],
): OrdersCatalogItem[] {
  let rows = [...items];
  if (statusScope) {
    rows = rows.filter((r) => statusScope.includes(r.displayStatus));
  }
  if (filters.status !== "all") {
    rows = rows.filter((r) => r.displayStatus === filters.status);
  }
  if (filters.warehouse !== "all") {
    rows = rows.filter((r) => r.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    rows = rows.filter((r) => r.sellerName === filters.seller);
  }
  if (filters.paymentType !== "all") {
    rows = rows.filter((r) => r.paymentMethodId === filters.paymentType);
  }
  if (filters.deliveryType !== "all") {
    rows = rows.filter((r) => r.deliveryType === filters.deliveryType);
  }
  if (filters.dateFrom) {
    rows = rows.filter((r) => r.createdAt.slice(0, 10) >= filters.dateFrom);
  }
  if (filters.dateTo) {
    rows = rows.filter((r) => r.createdAt.slice(0, 10) <= filters.dateTo);
  }
  const q = filters.search.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.poNumber.toLowerCase().includes(q) ||
        r.productName.toLowerCase().includes(q) ||
        r.sellerName.toLowerCase().includes(q) ||
        r.warehouse.toLowerCase().includes(q),
    );
  }

  rows.sort((a, b) => {
    switch (filters.sortBy) {
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "amount_desc":
        return b.grandTotal - a.grandTotal;
      case "amount_asc":
        return a.grandTotal - b.grandTotal;
      case "delivery_date":
        return a.expectedDelivery.localeCompare(b.expectedDelivery);
      case "newest":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  return rows;
}
