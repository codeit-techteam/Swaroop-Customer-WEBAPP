"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_PAYMENTS_FILTERS,
  computeCredit15Summary,
  computeCredit30Summary,
  invoicesCatalogMock,
  paymentNotificationsMock,
  paymentsCatalogMock,
  receiptsCatalogMock,
} from "@/mock/payments-catalog";
import type {
  CreditSummary,
  InvoiceRecord,
  PaymentNotification,
  PaymentProof,
  PaymentRecord,
  PaymentStatus,
  PaymentTypeId,
  PaymentsDashboardSummary,
  PaymentsFiltersState,
  ReceiptRecord,
  TransferMethodId,
  UploadProofFormState,
} from "@/types/payments";
import {
  advanceTimelineAfterSubmit,
  markTimelineVerified,
} from "@/lib/payment-timeline";

const STORAGE_KEY = "petrotrade.payments-catalog.v1";

function nowIso() {
  return new Date().toISOString();
}

function computeSummary(payments: PaymentRecord[]): PaymentsDashboardSummary {
  const open = payments.filter(
    (p) => !["paid", "verified", "cancelled", "refunded"].includes(p.status),
  );
  const monthStart = new Date("2026-08-01T00:00:00+05:30").getTime();
  const paidThisMonth = payments
    .filter(
      (p) =>
        (p.status === "paid" || p.status === "verified") &&
        p.paymentDate &&
        new Date(p.paymentDate).getTime() >= monthStart,
    )
    .reduce((s, p) => s + p.totalAmount, 0);

  return {
    totalOutstanding: open.reduce((s, p) => s + p.remainingBalance, 0),
    paidThisMonth,
    pendingPayments: open.filter((p) =>
      [
        "pending",
        "pending_payment",
        "payment_submitted",
        "verification_pending",
        "processing",
      ].includes(p.status),
    ).length,
    upcomingCreditDue: payments
      .filter(
        (p) =>
          (p.paymentType === "credit_15" || p.paymentType === "credit_30") &&
          ["pending", "overdue"].includes(p.status),
      )
      .reduce((s, p) => s + p.remainingBalance, 0),
    overduePayments: payments.filter((p) => p.status === "overdue").length,
    availableCredit:
      computeCredit15Summary(payments).availableCredit +
      computeCredit30Summary(payments).availableCredit,
  };
}

export function filterSortPayments(
  items: PaymentRecord[],
  filters: PaymentsFiltersState,
  typeConstraint?: PaymentTypeId | PaymentTypeId[],
): PaymentRecord[] {
  let list = [...items];

  if (typeConstraint) {
    const types = Array.isArray(typeConstraint)
      ? typeConstraint
      : [typeConstraint];
    list = list.filter((p) => types.includes(p.paymentType));
  }

  if (filters.paymentType !== "all") {
    list = list.filter((p) => p.paymentType === filters.paymentType);
  }
  if (filters.status !== "all") {
    list = list.filter((p) => p.status === filters.status);
  }
  if (filters.warehouse !== "all") {
    list = list.filter((p) => p.warehouse === filters.warehouse);
  }
  if (filters.seller !== "all") {
    list = list.filter((p) => p.seller === filters.seller);
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    list = list.filter((p) => new Date(p.dueDate).getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    list = list.filter((p) => new Date(p.dueDate).getTime() <= to);
  }
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter((p) =>
      [
        p.orderNumber,
        p.poNumber,
        p.invoiceNumber,
        p.product,
        p.warehouse,
        p.seller,
        p.transactionId,
        p.utrNumber,
        p.paymentId,
        p.paymentReference,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }

  list.sort((a, b) => {
    const dir = filters.sortDir === "asc" ? 1 : -1;
    switch (filters.sortBy) {
      case "amount":
        return (a.totalAmount - b.totalAmount) * dir;
      case "paymentDate": {
        const av = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
        const bv = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
        return (av - bv) * dir;
      }
      case "orderNumber":
        return a.orderNumber.localeCompare(b.orderNumber) * dir;
      case "status":
        return a.status.localeCompare(b.status) * dir;
      case "dueDate":
      default:
        return (
          (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * dir
        );
    }
  });

  return list;
}

type PaymentsCatalogState = {
  payments: PaymentRecord[];
  invoices: InvoiceRecord[];
  receipts: ReceiptRecord[];
  notifications: PaymentNotification[];
  filters: PaymentsFiltersState;
  page: number;
  pageSize: number;
  isHydrated: boolean;
};

type PaymentsCatalogActions = {
  setHydrated: (v: boolean) => void;
  setFilters: (patch: Partial<PaymentsFiltersState>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  getPayment: (id: string) => PaymentRecord | undefined;
  getSummary: () => PaymentsDashboardSummary;
  getCredit15: () => CreditSummary;
  getCredit30: () => CreditSummary;
  submitAdvanceProof: (paymentId: string, proof: PaymentProof) => void;
  /** Demo helper: simulate finance approving a pending verification */
  verifyAdvancePayment: (paymentId: string) => void;
  rejectAdvancePayment: (
    paymentId: string,
    reason: NonNullable<PaymentRecord["rejection"]>["reason"],
    message: string,
  ) => void;
  payCredit: (paymentId: string, method?: TransferMethodId) => void;
  payOnLoading: (paymentId: string, method?: TransferMethodId) => void;
  payOnDelivery: (paymentId: string, method?: TransferMethodId) => void;
  markNotificationRead: (id: string) => void;
  createEmptyUploadForm: (payment: PaymentRecord) => UploadProofFormState;
};

export type PaymentsCatalogStore = PaymentsCatalogState &
  PaymentsCatalogActions;

function ensureInvoice(
  payment: PaymentRecord,
  invoices: InvoiceRecord[],
): InvoiceRecord[] {
  const exists = invoices.some((i) => i.paymentId === payment.paymentId);
  if (exists) {
    return invoices.map((i) =>
      i.paymentId === payment.paymentId
        ? {
            ...i,
            status: "paid" as const,
            advancePaymentStatus: payment.status,
            transactionId: payment.transactionId,
            utrNumber: payment.utrNumber,
            verificationDate: payment.verifiedAt,
          }
        : i,
    );
  }
  return [
    {
      id: `INV-REC-${payment.id}`,
      invoiceNumber:
        payment.invoiceNumber ?? `INV-2026-${payment.id.slice(-4)}`,
      orderNumber: payment.orderNumber,
      poNumber: payment.poNumber,
      paymentId: payment.paymentId,
      product: payment.product,
      seller: payment.seller,
      warehouse: payment.warehouse,
      amount: payment.amount,
      gst: payment.gst,
      freight: payment.freight,
      insurance: payment.insurance,
      totalAmount: payment.totalAmount,
      issueDate: payment.createdAt,
      status: "paid",
      paymentType: payment.paymentType,
      advancePaymentStatus: payment.status,
      transactionId: payment.transactionId,
      utrNumber: payment.utrNumber,
      verificationDate: payment.verifiedAt,
    },
    ...invoices,
  ];
}

function ensureReceipt(
  payment: PaymentRecord,
  receipts: ReceiptRecord[],
): ReceiptRecord[] {
  if (!payment.transactionId) return receipts;
  const exists = receipts.some((r) => r.paymentId === payment.paymentId);
  if (exists) {
    return receipts.map((r) =>
      r.paymentId === payment.paymentId
        ? {
            ...r,
            transactionId: payment.transactionId!,
            utrNumber: payment.utrNumber,
            verificationDate: payment.verifiedAt,
            paymentDate: payment.paymentDate ?? nowIso(),
            paymentMethod: payment.paymentMethod ?? r.paymentMethod,
          }
        : r,
    );
  }
  const receiptNumber =
    payment.receiptNumber ??
    `RCT-2026-${String(receipts.length + 401).padStart(4, "0")}`;
  return [
    {
      id: `RCT-REC-${payment.id}`,
      receiptNumber,
      paymentId: payment.paymentId,
      orderNumber: payment.orderNumber,
      poNumber: payment.poNumber,
      invoiceNumber: payment.invoiceNumber,
      transactionId: payment.transactionId,
      utrNumber: payment.utrNumber,
      amount: payment.amount,
      gst: payment.gst,
      totalAmount: payment.totalAmount,
      paymentMethod: payment.paymentMethod ?? "NEFT",
      paymentType: payment.paymentType,
      paymentDate: payment.paymentDate ?? nowIso(),
      verificationDate: payment.verifiedAt,
      status: "generated",
      seller: payment.seller,
      warehouse: payment.warehouse,
    },
    ...receipts,
  ];
}

function settlePayment(
  payment: PaymentRecord,
  method: TransferMethodId,
  status: PaymentStatus = "verified",
): PaymentRecord {
  const ts = nowIso();
  const transactionId =
    payment.transactionId ?? `TXN${Date.now().toString().slice(-8)}`;
  const receiptNumber =
    payment.receiptNumber ?? `RCT-2026-${payment.id.slice(-4)}`;
  return {
    ...payment,
    status,
    amountPaid: payment.totalAmount,
    remainingBalance: 0,
    paymentDate: ts,
    verifiedAt: ts,
    verifiedBy: "Priya Sharma · Finance",
    verificationNotes: "UTR matched with bank statement. Amount verified.",
    transactionId,
    paymentMethod: method,
    paymentReference: payment.paymentReference ?? `REF-${payment.id.slice(-4)}`,
    receiptNumber,
    updatedAt: ts,
    timeline: markTimelineVerified(payment.timeline, ts),
  };
}

export const usePaymentsCatalogStore = create<PaymentsCatalogStore>()(
  persist(
    (set, get) => ({
      payments: paymentsCatalogMock,
      invoices: invoicesCatalogMock,
      receipts: receiptsCatalogMock,
      notifications: paymentNotificationsMock,
      filters: { ...DEFAULT_PAYMENTS_FILTERS },
      page: 1,
      pageSize: 10,
      isHydrated: false,

      setHydrated: (v) => set({ isHydrated: v }),

      setFilters: (patch) =>
        set((s) => ({
          filters: { ...s.filters, ...patch },
          page: 1,
        })),

      resetFilters: () =>
        set({ filters: { ...DEFAULT_PAYMENTS_FILTERS }, page: 1 }),

      setPage: (page) => set({ page }),

      getPayment: (id) =>
        get().payments.find((p) => p.id === id || p.paymentId === id),

      getSummary: () => computeSummary(get().payments),

      getCredit15: () => computeCredit15Summary(get().payments),

      getCredit30: () => computeCredit30Summary(get().payments),

      createEmptyUploadForm: (payment) => ({
        transactionType: "NEFT",
        utr: "",
        transactionDate: new Date().toISOString().slice(0, 10),
        transactionTime: new Date().toTimeString().slice(0, 5),
        paidAmount: payment.totalAmount,
        remarks: "",
        screenshot: null,
        receipt: null,
        bankAdvice: null,
      }),

      submitAdvanceProof: (paymentId, proof) => {
        const ts = nowIso();
        set((state) => {
          const payments = state.payments.map((p) => {
            if (p.id !== paymentId && p.paymentId !== paymentId) return p;
            return {
              ...p,
              status: "verification_pending" as const,
              utrNumber: proof.utr,
              paymentMethod: proof.transactionType,
              amountPaid: proof.paidAmount,
              remainingBalance: Math.max(0, p.totalAmount - proof.paidAmount),
              paymentDate: ts,
              transactionId:
                p.transactionId ?? `TXN${Date.now().toString().slice(-8)}`,
              paymentReference: p.paymentReference ?? `REF-${p.id.slice(-4)}`,
              proof,
              rejection: undefined,
              updatedAt: ts,
              timeline: advanceTimelineAfterSubmit(p.timeline, ts, proof.utr),
            };
          });

          const updated = payments.find(
            (p) => p.id === paymentId || p.paymentId === paymentId,
          )!;

          const notification: PaymentNotification = {
            id: `pn-${Date.now()}`,
            type: "verification_pending",
            title: "Verification Pending",
            message: `Your UTR ${proof.utr} for ${updated.orderNumber} is under finance verification.`,
            paymentId: updated.paymentId,
            orderNumber: updated.orderNumber,
            createdAt: ts,
            read: false,
          };

          return {
            payments,
            notifications: [notification, ...state.notifications],
          };
        });
      },

      verifyAdvancePayment: (paymentId) => {
        const ts = nowIso();
        set((state) => {
          let updated: PaymentRecord | undefined;
          const payments = state.payments.map((p) => {
            if (p.id !== paymentId && p.paymentId !== paymentId) return p;
            updated = settlePayment(p, p.paymentMethod ?? "NEFT", "verified");
            return updated;
          });
          if (!updated) return state;

          const invoices = ensureInvoice(updated, state.invoices);
          const receipts = ensureReceipt(
            { ...updated, receiptNumber: updated.receiptNumber },
            state.receipts,
          );

          const notifications: PaymentNotification[] = [
            {
              id: `pn-ok-${Date.now()}`,
              type: "payment_verified",
              title: "Advance Payment Verified",
              message: `${updated.paymentId} verified. Order moved to processing.`,
              paymentId: updated.paymentId,
              orderNumber: updated.orderNumber,
              createdAt: ts,
              read: false,
            },
            {
              id: `pn-rct-${Date.now()}`,
              type: "receipt_generated",
              title: "Receipt Generated",
              message: `Receipt ${updated.receiptNumber} has been generated.`,
              paymentId: updated.paymentId,
              orderNumber: updated.orderNumber,
              createdAt: ts,
              read: false,
            },
            ...state.notifications,
          ];

          return { payments, invoices, receipts, notifications };
        });
      },

      rejectAdvancePayment: (paymentId, reason, message) => {
        const ts = nowIso();
        set((state) => {
          const payments = state.payments.map((p) => {
            if (p.id !== paymentId && p.paymentId !== paymentId) return p;
            return {
              ...p,
              status: "rejected" as const,
              rejection: {
                reason,
                message,
                rejectedAt: ts,
                rejectedBy: "Finance Ops",
              },
              updatedAt: ts,
              timeline: p.timeline.map((step) =>
                step.id === "finance_verification"
                  ? { ...step, status: "failed" as const, at: ts }
                  : step,
              ),
            };
          });
          const updated = payments.find(
            (p) => p.id === paymentId || p.paymentId === paymentId,
          );
          return {
            payments,
            notifications: updated
              ? [
                  {
                    id: `pn-rej-${Date.now()}`,
                    type: "payment_rejected" as const,
                    title: "Payment Rejected",
                    message: `Payment proof for ${updated.paymentId} was rejected. Please upload again.`,
                    paymentId: updated.paymentId,
                    orderNumber: updated.orderNumber,
                    createdAt: ts,
                    read: false,
                  },
                  ...state.notifications,
                ]
              : state.notifications,
          };
        });
      },

      payCredit: (paymentId, method = "NEFT") => {
        set((state) => {
          let updated: PaymentRecord | undefined;
          const payments = state.payments.map((p) => {
            if (p.id !== paymentId && p.paymentId !== paymentId) return p;
            updated = settlePayment(p, method, "paid");
            return updated;
          });
          if (!updated) return state;
          return {
            payments,
            invoices: ensureInvoice(updated, state.invoices),
            receipts: ensureReceipt(updated, state.receipts),
            notifications: [
              {
                id: `pn-credit-${Date.now()}`,
                type: "payment_successful" as const,
                title: "Payment Successful",
                message: `Credit payment ${updated.paymentId} settled successfully.`,
                paymentId: updated.paymentId,
                orderNumber: updated.orderNumber,
                createdAt: nowIso(),
                read: false,
              },
              ...state.notifications,
            ],
          };
        });
      },

      payOnLoading: (paymentId, method = "RTGS") => {
        get().payCredit(paymentId, method);
      },

      payOnDelivery: (paymentId, method = "IMPS") => {
        get().payCredit(paymentId, method);
      },

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        payments: state.payments,
        invoices: state.invoices,
        receipts: state.receipts,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
