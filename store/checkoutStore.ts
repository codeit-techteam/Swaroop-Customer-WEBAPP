"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLineItem } from "@/store/cartStore";
import type {
  CheckoutPaymentMethodId,
  CheckoutPaymentStatus,
  CreditTermDays,
} from "@/types/checkout-payment";
import {
  DEFAULT_CHECKOUT_PAYMENT_METHOD,
  DEFAULT_CREDIT_TERM_DAYS,
  generateProformaNumber,
  getCheckoutPaymentOption,
  getCreditTermLabel,
  paymentMethodSummaryLabel,
} from "@/mock/checkout-payment";

export interface CheckoutDeliveryAllocation {
  locationId: string;
  quantityMt: number;
}

export interface CheckoutAddress {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  phone: string;
}

export interface GeneratedPurchaseOrder {
  poNumber: string;
  createdAt: string;
  status:
    | "pending_seller_confirmation"
    | "seller_approved"
    | "payment_pending"
    | "paid"
    | "credit_allocated";
  confirmationEndsAt: string;
  items: CartLineItem[];
  deliveryAllocations: CheckoutDeliveryAllocation[];
  shippingAddressId: string;
  billingAddressId: string;
  subtotal: number;
  gst: number;
  estimatedFreight: number;
  insuranceLabel: string;
  grandTotal: number;
  /** Selected before PO — shared with seller during approval */
  paymentMethodId?: CheckoutPaymentMethodId;
  paymentMethodTitle?: string;
  paymentTiming?: string;
  creditTermDays?: CreditTermDays;
  paymentStatus?: CheckoutPaymentStatus;
  proformaInvoiceNumber?: string;
  proformaGeneratedAt?: string;
  paymentCompletedAt?: string;
  creditDueDate?: string;
}

/** @deprecated Prefer adaptive timelines from mock/checkout-payment */
export type PoTimelineStepId =
  | "po_created"
  | "seller_review"
  | "seller_approved"
  | "proforma"
  | "payment_pending"
  | "payment_confirmed"
  | "tax_invoice"
  | "shipment_ready"
  | "in_transit"
  | "delivered";

export interface CheckoutStoreState {
  deliveryAllocations: CheckoutDeliveryAllocation[];
  shippingAddressId: string;
  billingAddressId: string;
  sameAsShipping: boolean;
  gstNumber: string;
  remarks: string;
  customAddresses: CheckoutAddress[];
  selectedPaymentMethodId: CheckoutPaymentMethodId | null;
  creditTermDays: CreditTermDays;
  activePurchaseOrder: GeneratedPurchaseOrder | null;
  sellerApproved: boolean;

  setDeliveryAllocation: (locationId: string, quantityMt: number) => void;
  removeDeliveryAllocation: (locationId: string) => void;
  setShippingAddressId: (id: string) => void;
  setBillingAddressId: (id: string) => void;
  setSameAsShipping: (value: boolean) => void;
  setGstNumber: (value: string) => void;
  setRemarks: (value: string) => void;
  setSelectedPaymentMethodId: (id: CheckoutPaymentMethodId) => void;
  setCreditTermDays: (days: CreditTermDays) => void;
  addCustomAddress: (address: Omit<CheckoutAddress, "id">) => string;
  generatePurchaseOrder: (input: {
    items: CartLineItem[];
    subtotal: number;
    gst: number;
    estimatedFreight: number;
  }) => GeneratedPurchaseOrder;
  tickSellerApproval: () => boolean;
  markSellerApproved: () => void;
  generateProformaInvoice: () => string | null;
  completeMockPayment: () => void;
  clearPurchaseOrder: () => void;
  resetCheckout: () => void;
}

const CONFIRMATION_WINDOW_MS = 15 * 60 * 1000;

function generatePoNumber(): string {
  const seq = Math.floor(10000 + Math.random() * 90000);
  return `PO-2026-${seq}`;
}

function addDaysIso(fromIso: string, days: number): string {
  const d = new Date(fromIso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * checkoutStore — multi-location checkout + payment terms + PO timer (frontend mock).
 */
export const useCheckoutStore = create<CheckoutStoreState>()(
  persist(
    (set, get) => ({
      deliveryAllocations: [],
      shippingAddressId: "mumbai-plant",
      billingAddressId: "billing-hq",
      sameAsShipping: true,
      gstNumber: "27AABCP1234D1Z5",
      remarks: "",
      customAddresses: [],
      selectedPaymentMethodId: null,
      creditTermDays: DEFAULT_CREDIT_TERM_DAYS,
      activePurchaseOrder: null,
      sellerApproved: false,

      setDeliveryAllocation: (locationId, quantityMt) => {
        const qty = Math.max(0, Math.round(quantityMt));
        const existing = get().deliveryAllocations.filter(
          (a) => a.locationId !== locationId,
        );
        set({
          deliveryAllocations:
            qty <= 0
              ? existing
              : [...existing, { locationId, quantityMt: qty }],
        });
      },

      removeDeliveryAllocation: (locationId) =>
        set({
          deliveryAllocations: get().deliveryAllocations.filter(
            (a) => a.locationId !== locationId,
          ),
        }),

      setShippingAddressId: (id) => set({ shippingAddressId: id }),
      setBillingAddressId: (id) => set({ billingAddressId: id }),
      setSameAsShipping: (value) => {
        set({
          sameAsShipping: value,
          ...(value ? { billingAddressId: get().shippingAddressId } : {}),
        });
      },
      setGstNumber: (value) => set({ gstNumber: value }),
      setRemarks: (value) => set({ remarks: value }),
      setSelectedPaymentMethodId: (id) => set({ selectedPaymentMethodId: id }),
      setCreditTermDays: (days) => set({ creditTermDays: days }),

      addCustomAddress: (address) => {
        const id = `addr_${Date.now()}`;
        set({
          customAddresses: [...get().customAddresses, { ...address, id }],
          shippingAddressId: id,
          ...(get().sameAsShipping ? { billingAddressId: id } : {}),
        });
        return id;
      },

      generatePurchaseOrder: ({ items, subtotal, gst, estimatedFreight }) => {
        const methodId =
          get().selectedPaymentMethodId ?? DEFAULT_CHECKOUT_PAYMENT_METHOD;
        const option = getCheckoutPaymentOption(methodId);
        const creditTermDays =
          methodId === "credit" ? get().creditTermDays : undefined;
        const now = Date.now();
        const nowIso = new Date(now).toISOString();
        const po: GeneratedPurchaseOrder = {
          poNumber: generatePoNumber(),
          createdAt: nowIso,
          status: "pending_seller_confirmation",
          confirmationEndsAt: new Date(
            now + CONFIRMATION_WINDOW_MS,
          ).toISOString(),
          items,
          deliveryAllocations: get().deliveryAllocations,
          shippingAddressId: get().shippingAddressId,
          billingAddressId: get().sameAsShipping
            ? get().shippingAddressId
            : get().billingAddressId,
          subtotal,
          gst,
          estimatedFreight,
          insuranceLabel: "Included",
          grandTotal: subtotal + gst + estimatedFreight,
          paymentMethodId: methodId,
          paymentMethodTitle: paymentMethodSummaryLabel(
            methodId,
            creditTermDays,
          ),
          paymentTiming:
            methodId === "credit" && creditTermDays
              ? getCreditTermLabel(creditTermDays)
              : option.timing,
          creditTermDays,
          paymentStatus: "pending_seller_approval",
        };
        set({
          activePurchaseOrder: po,
          sellerApproved: false,
          selectedPaymentMethodId: null,
        });
        return po;
      },

      tickSellerApproval: () => {
        const po = get().activePurchaseOrder;
        if (!po || get().sellerApproved) return get().sellerApproved;
        if (Date.now() >= new Date(po.confirmationEndsAt).getTime()) {
          get().markSellerApproved();
          return true;
        }
        return false;
      },

      markSellerApproved: () => {
        const po = get().activePurchaseOrder;
        if (!po) {
          set({ sellerApproved: true });
          return;
        }
        const methodId: CheckoutPaymentMethodId =
          po.paymentMethodId ?? "advance";
        // Auto-generate PI on approval (mock)
        const pi = po.proformaInvoiceNumber ?? generateProformaNumber();
        const approvedAt = new Date().toISOString();
        let paymentStatus: CheckoutPaymentStatus = "awaiting_payment";
        let status: GeneratedPurchaseOrder["status"] = "payment_pending";
        let paymentCompletedAt: string | undefined;
        let creditDueDate: string | undefined;

        if (methodId === "on_delivery") {
          paymentStatus = "payment_pending_delivery";
          status = "seller_approved";
        } else if (methodId === "credit") {
          paymentStatus = "credit_allocated";
          status = "credit_allocated";
          paymentCompletedAt = approvedAt;
          creditDueDate = addDaysIso(
            approvedAt,
            po.creditTermDays ?? DEFAULT_CREDIT_TERM_DAYS,
          );
        }

        set({
          sellerApproved: true,
          activePurchaseOrder: {
            ...po,
            paymentMethodId: methodId,
            paymentMethodTitle:
              po.paymentMethodTitle ??
              paymentMethodSummaryLabel(methodId, po.creditTermDays),
            paymentTiming:
              po.paymentTiming ??
              (methodId === "credit" && po.creditTermDays
                ? getCreditTermLabel(po.creditTermDays)
                : getCheckoutPaymentOption(methodId).timing),
            status,
            paymentStatus,
            proformaInvoiceNumber: pi,
            proformaGeneratedAt: approvedAt,
            paymentCompletedAt,
            creditDueDate,
          },
        });
      },

      generateProformaInvoice: () => {
        const po = get().activePurchaseOrder;
        if (!po) return null;
        if (po.proformaInvoiceNumber) return po.proformaInvoiceNumber;
        const pi = generateProformaNumber();
        set({
          activePurchaseOrder: {
            ...po,
            proformaInvoiceNumber: pi,
            proformaGeneratedAt: new Date().toISOString(),
          },
        });
        return pi;
      },

      completeMockPayment: () => {
        const po = get().activePurchaseOrder;
        if (!po) return;
        const paidAt = new Date().toISOString();
        set({
          activePurchaseOrder: {
            ...po,
            status: "paid",
            paymentStatus: "paid",
            paymentCompletedAt: paidAt,
          },
        });
      },

      clearPurchaseOrder: () =>
        set({ activePurchaseOrder: null, sellerApproved: false }),

      resetCheckout: () =>
        set({
          deliveryAllocations: [],
          remarks: "",
          selectedPaymentMethodId: null,
          creditTermDays: DEFAULT_CREDIT_TERM_DAYS,
        }),
    }),
    {
      name: "petrotrade.checkout.v1",
      partialize: (state) => ({
        deliveryAllocations: state.deliveryAllocations,
        shippingAddressId: state.shippingAddressId,
        billingAddressId: state.billingAddressId,
        sameAsShipping: state.sameAsShipping,
        gstNumber: state.gstNumber,
        customAddresses: state.customAddresses,
        selectedPaymentMethodId: state.selectedPaymentMethodId,
        creditTermDays: state.creditTermDays,
        activePurchaseOrder: state.activePurchaseOrder,
        sellerApproved: state.sellerApproved,
      }),
    },
  ),
);

/** Legacy linear timeline — prefer getAdaptiveTimeline for payment-aware UI */
export const PO_TIMELINE_STEPS: Array<{
  id: PoTimelineStepId;
  label: string;
}> = [
  { id: "po_created", label: "Purchase Order Created" },
  { id: "seller_review", label: "Seller Review" },
  { id: "seller_approved", label: "Seller Approved" },
  { id: "proforma", label: "Proforma Invoice" },
  { id: "payment_pending", label: "Payment Pending" },
  { id: "payment_confirmed", label: "Payment Confirmed" },
  { id: "tax_invoice", label: "Tax Invoice" },
  { id: "shipment_ready", label: "Shipment Ready" },
  { id: "in_transit", label: "In Transit" },
  { id: "delivered", label: "Delivered" },
];

export { CONFIRMATION_WINDOW_MS };
