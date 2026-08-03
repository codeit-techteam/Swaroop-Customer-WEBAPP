"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CustomerOrder,
  DeliveryDetails,
  DispatchDetails,
  ShipmentTimelineStepId,
  ShipmentTracking,
} from "@/types/order-journey";
import {
  createDeliveryDetails,
  createDispatchDetails,
  createShipmentTimeline,
  createShipmentTracking,
  progressForStep,
  SHIPMENT_STEP_SEQUENCE,
} from "@/mock/shipments";
import { useOrdersStore } from "./ordersStore";

const STORAGE_KEY = "petrotrade.shipment.v1";

type ShipmentState = {
  dispatchByOrder: Record<string, DispatchDetails>;
  shipments: Record<string, ShipmentTracking>;
  deliveryByOrder: Record<string, DeliveryDetails>;
  selectedShipmentId: string | null;
  isHydrated: boolean;
};

type ShipmentActions = {
  initFromOrder: (order: CustomerOrder) => void;
  startDispatch: (orderId: string) => void;
  advanceShipment: (orderId: string) => ShipmentTimelineStepId;
  completeDelivery: (orderId: string, destination: string) => DeliveryDetails;
  getDispatch: (orderId: string) => DispatchDetails | undefined;
  getShipment: (orderId: string) => ShipmentTracking | undefined;
  getDelivery: (orderId: string) => DeliveryDetails | undefined;
  setHydrated: (value: boolean) => void;
};

export type ShipmentStore = ShipmentState & ShipmentActions;

const initialState: ShipmentState = {
  dispatchByOrder: {},
  shipments: {},
  deliveryByOrder: {},
  selectedShipmentId: null,
  isHydrated: false,
};

export const useShipmentStore = create<ShipmentStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initFromOrder: (order) => {
        const existing = get().dispatchByOrder[order.id];
        if (existing) {
          set({ selectedShipmentId: order.id });
          return;
        }
        const dispatch = createDispatchDetails(
          order.id,
          order.warehouse,
          order.expectedDispatch,
        );
        const shipment = createShipmentTracking(order.id);
        set((state) => ({
          dispatchByOrder: { ...state.dispatchByOrder, [order.id]: dispatch },
          shipments: { ...state.shipments, [order.id]: shipment },
          selectedShipmentId: order.id,
        }));
      },

      startDispatch: (orderId) => {
        const now = new Date().toISOString();
        set((state) => {
          const dispatch = state.dispatchByOrder[orderId];
          const shipment = state.shipments[orderId];
          if (!dispatch || !shipment) return state;

          const nextStep: ShipmentTimelineStepId = "dispatched";
          return {
            dispatchByOrder: {
              ...state.dispatchByOrder,
              [orderId]: {
                ...dispatch,
                dispatchTime: now,
                loadingStatus: "Dispatched",
                currentLocation: "En route from warehouse",
              },
            },
            shipments: {
              ...state.shipments,
              [orderId]: {
                ...shipment,
                currentStep: nextStep,
                steps: createShipmentTimeline(nextStep, {
                  ready: now,
                  dispatched: now,
                }),
                progress: progressForStep(nextStep),
              },
            },
          };
        });
        useOrdersStore.getState().updateOrderStatus(orderId, "dispatched");
      },

      advanceShipment: (orderId) => {
        const shipment = get().shipments[orderId];
        if (!shipment) return "ready";

        const index = SHIPMENT_STEP_SEQUENCE.indexOf(shipment.currentStep);
        const nextIndex = Math.min(
          index + 1,
          SHIPMENT_STEP_SEQUENCE.length - 1,
        );
        const nextStep = SHIPMENT_STEP_SEQUENCE[nextIndex];
        const now = new Date().toISOString();

        set((state) => {
          const current = state.shipments[orderId];
          if (!current) return state;
          const timestamps: Partial<Record<ShipmentTimelineStepId, string>> =
            {};
          current.steps.forEach((step) => {
            if (step.timestamp) timestamps[step.id] = step.timestamp;
          });
          timestamps[nextStep] = now;

          return {
            shipments: {
              ...state.shipments,
              [orderId]: {
                ...current,
                currentStep: nextStep,
                steps: createShipmentTimeline(nextStep, timestamps),
                progress: progressForStep(nextStep),
              },
            },
            dispatchByOrder: {
              ...state.dispatchByOrder,
              [orderId]: state.dispatchByOrder[orderId]
                ? {
                    ...state.dispatchByOrder[orderId],
                    currentLocation:
                      nextStep === "near_destination"
                        ? "Near destination city"
                        : nextStep === "in_transit"
                          ? "Highway transit corridor"
                          : nextStep === "delivered"
                            ? "Delivered at buyer site"
                            : state.dispatchByOrder[orderId].currentLocation,
                  }
                : state.dispatchByOrder[orderId],
            },
          };
        });

        const statusMap: Record<
          ShipmentTimelineStepId,
          Parameters<
            ReturnType<typeof useOrdersStore.getState>["updateOrderStatus"]
          >[1]
        > = {
          ready: "dispatch_ready",
          dispatched: "dispatched",
          in_transit: "in_transit",
          near_destination: "near_destination",
          delivered: "delivered",
        };
        useOrdersStore
          .getState()
          .updateOrderStatus(orderId, statusMap[nextStep]);

        if (nextStep === "delivered") {
          const order = useOrdersStore.getState().getOrderById(orderId);
          if (order) {
            get().completeDelivery(orderId, order.destination);
          }
        }

        return nextStep;
      },

      completeDelivery: (orderId, destination) => {
        const existing = get().deliveryByOrder[orderId];
        if (existing) return existing;

        const delivery = createDeliveryDetails(orderId, destination);
        set((state) => ({
          deliveryByOrder: { ...state.deliveryByOrder, [orderId]: delivery },
          shipments: {
            ...state.shipments,
            [orderId]: state.shipments[orderId]
              ? {
                  ...state.shipments[orderId],
                  currentStep: "delivered",
                  steps: createShipmentTimeline("delivered"),
                  progress: 100,
                }
              : state.shipments[orderId],
          },
        }));
        useOrdersStore.getState().markDelivered(orderId);
        return delivery;
      },

      getDispatch: (orderId) => get().dispatchByOrder[orderId],
      getShipment: (orderId) => get().shipments[orderId],
      getDelivery: (orderId) => get().deliveryByOrder[orderId],

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        dispatchByOrder: state.dispatchByOrder,
        shipments: state.shipments,
        deliveryByOrder: state.deliveryByOrder,
        selectedShipmentId: state.selectedShipmentId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export { initialState as shipmentStoreInitialState };
