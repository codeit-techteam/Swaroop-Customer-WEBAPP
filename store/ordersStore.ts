"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CustomerOrder,
  OrderLifecycleStatus,
  OrderPaymentStatus,
} from "@/types/order-journey";
import type { SubmittedPurchaseRequest } from "@/types/purchase-request";
import { buildOrderFromPurchaseRequest } from "@/mock/orders";

const STORAGE_KEY = "petrotrade.orders.v1";

type OrdersState = {
  orders: CustomerOrder[];
  currentOrderId: string | null;
  isHydrated: boolean;
};

type OrdersActions = {
  createOrderFromPurchaseRequest: (
    submitted: SubmittedPurchaseRequest,
  ) => CustomerOrder;
  getOrderById: (id: string) => CustomerOrder | undefined;
  selectOrder: (id: string | null) => void;
  updateOrderStatus: (id: string, status: OrderLifecycleStatus) => void;
  setPaymentStatus: (id: string, status: OrderPaymentStatus) => void;
  attachDocuments: (
    id: string,
    docs: { invoiceNumber?: string; receiptNumber?: string },
  ) => void;
  markDelivered: (id: string) => void;
  setHydrated: (value: boolean) => void;
};

export type OrdersStore = OrdersState & OrdersActions;

const initialState: OrdersState = {
  orders: [],
  currentOrderId: null,
  isHydrated: false,
};

function patchOrder(
  orders: CustomerOrder[],
  id: string,
  patch: Partial<CustomerOrder>,
): CustomerOrder[] {
  return orders.map((order) =>
    order.id === id
      ? { ...order, ...patch, updatedAt: new Date().toISOString() }
      : order,
  );
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createOrderFromPurchaseRequest: (submitted) => {
        const existing = get().orders.find(
          (o) =>
            o.purchaseRequestId === submitted.id || o.id === submitted.orderId,
        );
        if (existing) {
          set({ currentOrderId: existing.id });
          return existing;
        }

        const order = buildOrderFromPurchaseRequest(submitted);
        set((state) => ({
          orders: [order, ...state.orders],
          currentOrderId: order.id,
        }));
        return order;
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      selectOrder: (id) => set({ currentOrderId: id }),

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: patchOrder(state.orders, id, { orderStatus: status }),
        }));
      },

      setPaymentStatus: (id, status) => {
        set((state) => {
          const patch: Partial<CustomerOrder> = { paymentStatus: status };
          if (status === "verified") {
            patch.orderStatus = "payment_verified";
          } else if (status === "pending" || status === "submitted") {
            patch.orderStatus = "payment_pending";
          }
          return { orders: patchOrder(state.orders, id, patch) };
        });
      },

      attachDocuments: (id, docs) => {
        set((state) => ({
          orders: patchOrder(state.orders, id, {
            invoiceNumber: docs.invoiceNumber ?? undefined,
            receiptNumber: docs.receiptNumber ?? undefined,
          }),
        }));
      },

      markDelivered: (id) => {
        const invoice = `INV-${id.replace(/^PT-ORD-/, "")}`;
        const receipt = `RCT-${id.replace(/^PT-ORD-/, "")}`;
        set((state) => {
          const order = state.orders.find((o) => o.id === id);
          if (!order) return state;

          let paymentStatus = order.paymentStatus;
          if (order.paymentStatus !== "verified") {
            if (order.paymentMethodId === "on_delivery") {
              paymentStatus = "pending";
            } else if (
              order.paymentMethodId === "credit_15" ||
              order.paymentMethodId === "credit_30"
            ) {
              paymentStatus = "outstanding";
            }
          }

          return {
            orders: patchOrder(state.orders, id, {
              orderStatus: "delivered",
              invoiceNumber: invoice,
              receiptNumber: receipt,
              paymentStatus,
            }),
          };
        });
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        orders: state.orders,
        currentOrderId: state.currentOrderId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export { initialState as ordersStoreInitialState };
