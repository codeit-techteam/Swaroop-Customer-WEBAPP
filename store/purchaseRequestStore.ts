"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PaymentMethodId,
  PurchaseRequestFormData,
  PurchaseRequestStep,
  PurchaseRequestStatus,
  SelectedProduct,
  SubmittedPurchaseRequest,
  ValidationStepId,
} from "@/types/purchase-request";
import {
  buildOrderSummary,
  createDefaultFormData,
  createInitialValidationTimeline,
  DEFAULT_PAYMENT_METHOD_ID,
  generateOrderId,
  generatePoNumber,
  generatePurchaseRequestId,
  getPaymentMethodById,
  mapProductToSelected,
  PRICE_LOCK_DURATION_SECONDS,
  VALIDATION_STEP_SEQUENCE,
} from "@/mock/purchase-request";
import { creditEligibilityMock } from "@/mock/purchase-request/creditEligibility";

const STORAGE_KEY = "petrotrade.purchase-request.v1";

type PurchaseRequestState = {
  product: SelectedProduct | null;
  form: PurchaseRequestFormData;
  selectedPaymentMethodId: PaymentMethodId;
  acceptedTerms: boolean;
  acceptedGstDeclaration: boolean;
  currentStep: PurchaseRequestStep;
  submittedRequest: SubmittedPurchaseRequest | null;
  requestStatus: PurchaseRequestStatus;
  approvalTimerSeconds: number;
  approvalStartedAt: string | null;
  validationCurrentStep: ValidationStepId;
  validationCompletedSteps: ValidationStepId[];
  isHydrated: boolean;
};

type PurchaseRequestActions = {
  hydrateProduct: (
    productId?: string | null,
    overrides?: {
      currentPricePerMt?: number;
      warehouse?: string;
      manufacturer?: string;
      moq?: number;
      paymentMethodId?: PaymentMethodId;
    },
  ) => void;
  setForm: (data: Partial<PurchaseRequestFormData>) => void;
  setQuantity: (quantityMt: number) => void;
  selectPayment: (methodId: PaymentMethodId) => void;
  setAcceptedTerms: (value: boolean) => void;
  setAcceptedGstDeclaration: (value: boolean) => void;
  setCurrentStep: (step: PurchaseRequestStep) => void;
  getOrderSummary: () => ReturnType<typeof buildOrderSummary> | null;
  submitRequest: () => SubmittedPurchaseRequest | null;
  startApprovalCountdown: () => void;
  tickApprovalTimer: () => void;
  refreshApprovalStatus: () => void;
  advanceValidationStep: () => void;
  approveRequest: () => void;
  rejectRequest: () => void;
  withdrawRequest: () => void;
  resetDraft: () => void;
  setHydrated: (value: boolean) => void;
};

export type PurchaseRequestStore = PurchaseRequestState &
  PurchaseRequestActions;

const defaultProduct = null as SelectedProduct | null;

const initialTimeline = createInitialValidationTimeline();

const initialState: PurchaseRequestState = {
  product: defaultProduct,
  form: createDefaultFormData(25),
  selectedPaymentMethodId: DEFAULT_PAYMENT_METHOD_ID,
  acceptedTerms: false,
  acceptedGstDeclaration: false,
  currentStep: "create",
  submittedRequest: null,
  requestStatus: "draft",
  approvalTimerSeconds: PRICE_LOCK_DURATION_SECONDS,
  approvalStartedAt: null,
  validationCurrentStep: initialTimeline.currentStep,
  validationCompletedSteps: initialTimeline.completedSteps,
  isHydrated: false,
};

export const usePurchaseRequestStore = create<PurchaseRequestStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      hydrateProduct: (productId, overrides) => {
        const id = productId?.trim();
        if (!id) return;
        const mapped = mapProductToSelected(id, overrides);
        if (!mapped) return;

        const { form, product, requestStatus } = get();

        // Same product + same offer price: keep draft edits and in-flight state.
        if (
          product?.id === mapped.id &&
          product.currentPricePerMt === mapped.currentPricePerMt &&
          requestStatus !== "withdrawn"
        ) {
          if (overrides?.paymentMethodId) {
            const method = getPaymentMethodById(overrides.paymentMethodId);
            if (
              method &&
              !(method.hasCredit && !creditEligibilityMock.approved)
            ) {
              set({ selectedPaymentMethodId: overrides.paymentMethodId });
            }
          }
          return;
        }

        const timeline = createInitialValidationTimeline();
        const paymentMethodId =
          overrides?.paymentMethodId &&
          getPaymentMethodById(overrides.paymentMethodId)
            ? overrides.paymentMethodId
            : DEFAULT_PAYMENT_METHOD_ID;

        set({
          product: mapped,
          form: {
            ...createDefaultFormData(mapped.moq, mapped.packaging),
            gstNumber: form.gstNumber || "27AABCP1234D1Z5",
          },
          currentStep: "create",
          requestStatus: "draft",
          submittedRequest: null,
          acceptedTerms: false,
          acceptedGstDeclaration: false,
          selectedPaymentMethodId: paymentMethodId,
          approvalTimerSeconds: PRICE_LOCK_DURATION_SECONDS,
          approvalStartedAt: null,
          validationCurrentStep: timeline.currentStep,
          validationCompletedSteps: timeline.completedSteps,
        });
      },

      setForm: (data) => {
        set((state) => ({
          form: { ...state.form, ...data },
        }));
      },

      setQuantity: (quantityMt) => {
        const { product } = get();
        if (!product) return;
        const clamped = Math.max(
          product.moq,
          Math.min(product.availableStock, Math.round(quantityMt)),
        );
        set((state) => ({
          form: { ...state.form, quantityMt: clamped },
        }));
      },

      selectPayment: (methodId) => {
        const method = getPaymentMethodById(methodId);
        if (method.hasCredit && !creditEligibilityMock.approved) {
          return;
        }
        set({ selectedPaymentMethodId: methodId });
      },

      setAcceptedTerms: (value) => set({ acceptedTerms: value }),
      setAcceptedGstDeclaration: (value) =>
        set({ acceptedGstDeclaration: value }),
      setCurrentStep: (step) => set({ currentStep: step }),

      getOrderSummary: () => {
        const { product, form, selectedPaymentMethodId } = get();
        if (!product) return null;
        return buildOrderSummary({
          product,
          quantityMt: form.quantityMt,
          shippingAddressId: form.shippingAddressId,
          paymentMethodId: selectedPaymentMethodId,
        });
      },

      submitRequest: () => {
        const state = get();
        const {
          product,
          form,
          selectedPaymentMethodId,
          acceptedTerms,
          acceptedGstDeclaration,
        } = state;
        if (!product || !acceptedTerms || !acceptedGstDeclaration) {
          return null;
        }

        const summary = buildOrderSummary({
          product,
          quantityMt: form.quantityMt,
          shippingAddressId: form.shippingAddressId,
          paymentMethodId: selectedPaymentMethodId,
        });
        const method = getPaymentMethodById(selectedPaymentMethodId);
        const displayId = generatePurchaseRequestId();
        const now = new Date().toISOString();

        const submitted: SubmittedPurchaseRequest = {
          id: displayId.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          displayId,
          orderId: null,
          poNumber: null,
          product,
          form: { ...form },
          paymentMethodId: selectedPaymentMethodId,
          paymentMethodTitle: method.title,
          summary,
          status: "submitted",
          priceLockStatus: "active",
          priceLockDurationSeconds: PRICE_LOCK_DURATION_SECONDS,
          approvalStartedAt: null,
          expectedDispatch: "Within 2 Days",
          createdAt: now,
          acceptedTerms,
          acceptedGstDeclaration,
        };

        set({
          submittedRequest: submitted,
          requestStatus: "submitted",
          currentStep: "submitted",
          approvalTimerSeconds: PRICE_LOCK_DURATION_SECONDS,
          approvalStartedAt: null,
          validationCurrentStep: initialTimeline.currentStep,
          validationCompletedSteps: initialTimeline.completedSteps,
        });

        return submitted;
      },

      startApprovalCountdown: () => {
        const startedAt = new Date().toISOString();
        set((state) => ({
          requestStatus: "pending_approval",
          currentStep: "pending_approval",
          approvalStartedAt: startedAt,
          approvalTimerSeconds: PRICE_LOCK_DURATION_SECONDS,
          submittedRequest: state.submittedRequest
            ? {
                ...state.submittedRequest,
                status: "pending_approval",
                approvalStartedAt: startedAt,
                priceLockStatus: "active",
              }
            : null,
        }));
      },

      tickApprovalTimer: () => {
        const { approvalTimerSeconds, requestStatus } = get();
        if (requestStatus !== "pending_approval") return;
        if (approvalTimerSeconds <= 0) {
          set((state) => ({
            approvalTimerSeconds: 0,
            submittedRequest: state.submittedRequest
              ? {
                  ...state.submittedRequest,
                  priceLockStatus: "expired",
                }
              : null,
          }));
          return;
        }
        set({ approvalTimerSeconds: approvalTimerSeconds - 1 });
      },

      refreshApprovalStatus: () => {
        get().advanceValidationStep();
      },

      advanceValidationStep: () => {
        const {
          validationCurrentStep,
          validationCompletedSteps,
          requestStatus,
        } = get();
        if (requestStatus !== "pending_approval") return;

        const currentIndex = VALIDATION_STEP_SEQUENCE.indexOf(
          validationCurrentStep,
        );
        if (currentIndex < 0) return;

        const nextCompleted = validationCompletedSteps.includes(
          validationCurrentStep,
        )
          ? validationCompletedSteps
          : [...validationCompletedSteps, validationCurrentStep];

        const nextIndex = currentIndex + 1;
        if (nextIndex >= VALIDATION_STEP_SEQUENCE.length) {
          get().approveRequest();
          return;
        }

        set({
          validationCompletedSteps: nextCompleted,
          validationCurrentStep: VALIDATION_STEP_SEQUENCE[nextIndex],
        });
      },

      approveRequest: () => {
        const { submittedRequest } = get();
        if (!submittedRequest) return;

        const orderId = generateOrderId(submittedRequest.displayId);
        const poNumber = generatePoNumber(orderId);

        set({
          requestStatus: "approved",
          currentStep: "approved",
          approvalTimerSeconds: 0,
          validationCurrentStep: "purchase_order_generation",
          validationCompletedSteps: [...VALIDATION_STEP_SEQUENCE],
          submittedRequest: {
            ...submittedRequest,
            status: "approved",
            orderId,
            poNumber,
            priceLockStatus: "released",
          },
        });
      },

      rejectRequest: () => {
        set((state) => ({
          requestStatus: "rejected",
          submittedRequest: state.submittedRequest
            ? {
                ...state.submittedRequest,
                status: "rejected",
                priceLockStatus: "expired",
              }
            : null,
          approvalTimerSeconds: 0,
        }));
      },

      withdrawRequest: () => {
        set((state) => ({
          requestStatus: "withdrawn",
          currentStep: "create",
          submittedRequest: state.submittedRequest
            ? { ...state.submittedRequest, status: "withdrawn" }
            : null,
          approvalStartedAt: null,
          approvalTimerSeconds: PRICE_LOCK_DURATION_SECONDS,
        }));
      },

      resetDraft: () => {
        const product = get().product ?? defaultProduct;
        set({
          ...initialState,
          product,
          form: createDefaultFormData(product?.moq ?? 25, product?.packaging),
          isHydrated: true,
        });
      },

      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        product: state.product,
        form: state.form,
        selectedPaymentMethodId: state.selectedPaymentMethodId,
        acceptedTerms: state.acceptedTerms,
        acceptedGstDeclaration: state.acceptedGstDeclaration,
        currentStep: state.currentStep,
        submittedRequest: state.submittedRequest,
        requestStatus: state.requestStatus,
        approvalTimerSeconds: state.approvalTimerSeconds,
        approvalStartedAt: state.approvalStartedAt,
        validationCurrentStep: state.validationCurrentStep,
        validationCompletedSteps: state.validationCompletedSteps,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const purchaseRequestStoreInitialState = initialState;
