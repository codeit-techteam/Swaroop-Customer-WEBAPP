"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ONBOARDING_STORAGE_KEY,
  getNextStep,
  getStepIndex,
} from "@/constants/onboarding";
import { setOnboardingCompleteCookie } from "@/lib/onboarding-cookie";
import type {
  BusinessAddress,
  CompanyInfo,
  CreditDocuments,
  GstInfo,
  GstVerificationResult,
  OnboardingState,
  OnboardingStepId,
  ShippingAddress,
  UploadedDocument,
} from "@/types/onboarding";

function createId(): string {
  return `ship_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const emptyCompanyInfo: CompanyInfo = {
  legalName: "",
  constitutionType: "",
  industrySector: "",
  registrationNumber: "",
  dateOfIncorporation: "",
};

const emptyGstInfo: GstInfo = {
  gstin: "",
  isVerified: false,
  certificateFileName: null,
  verification: null,
};

const emptyBusinessAddress: BusinessAddress = {
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  city: "",
  state: "",
  country: "India",
  useAsShipping: false,
};

const emptyCreditDocuments: CreditDocuments = {
  auditedFinancials: null,
  bankStatements: null,
  itr: null,
};

const initialState: OnboardingState = {
  currentStep: "company-information",
  completedSteps: [],
  companyInfo: emptyCompanyInfo,
  gstInfo: emptyGstInfo,
  businessAddress: emptyBusinessAddress,
  shippingAddresses: [],
  creditDocuments: emptyCreditDocuments,
  creditLimit: "",
  isCompleted: true,
  hasStartedOnboarding: false,
  draftSavedAt: null,
};

function markStepComplete(
  completed: OnboardingStepId[],
  step: OnboardingStepId,
): OnboardingStepId[] {
  if (completed.includes(step)) return completed;
  return [...completed, step];
}

function mockVerifyGst(gstin: string): GstVerificationResult {
  const pan = gstin.slice(2, 12).toUpperCase();
  return {
    companyName: "PetroChem Solutions Ltd.",
    entityStatus: "Active",
    registeredOn: "12 Oct 2018",
    pan,
  };
}

export interface OnboardingStoreActions {
  setCurrentStep: (step: OnboardingStepId) => void;
  saveCompany: (data: CompanyInfo) => void;
  verifyGST: (gstin: string) => GstVerificationResult;
  setGstCertificate: (fileName: string | null) => void;
  saveGstInfo: (data: Partial<GstInfo>) => void;
  saveBusinessAddress: (data: BusinessAddress) => void;
  addShipping: (data: Omit<ShippingAddress, "id">) => void;
  updateShipping: (id: string, data: Omit<ShippingAddress, "id">) => void;
  deleteShipping: (id: string) => void;
  saveCredit: (docs: CreditDocuments, creditLimit: string) => void;
  setCreditDocument: (
    key: keyof CreditDocuments,
    doc: UploadedDocument | null,
  ) => void;
  completeOnboarding: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
  canAccessStep: (step: OnboardingStepId) => boolean;
  reset: () => void;
}

export type OnboardingStore = OnboardingState & OnboardingStoreActions;

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      saveCompany: (data) => {
        const next = getNextStep("company-information");
        set({
          companyInfo: data,
          completedSteps: markStepComplete(
            get().completedSteps,
            "company-information",
          ),
          currentStep: next?.id ?? "gst-verification",
        });
      },

      verifyGST: (gstin) => {
        const verification = mockVerifyGst(gstin);
        set({
          gstInfo: {
            ...get().gstInfo,
            gstin: gstin.toUpperCase(),
            isVerified: true,
            verification,
          },
        });
        return verification;
      },

      setGstCertificate: (fileName) => {
        set({
          gstInfo: {
            ...get().gstInfo,
            certificateFileName: fileName,
          },
        });
      },

      saveGstInfo: (data) => {
        const next = getNextStep("gst-verification");
        set({
          gstInfo: { ...get().gstInfo, ...data },
          completedSteps: markStepComplete(
            get().completedSteps,
            "gst-verification",
          ),
          currentStep: next?.id ?? "business-address",
        });
      },

      saveBusinessAddress: (data) => {
        const next = getNextStep("business-address");
        const state = get();
        let shippingAddresses = state.shippingAddresses;

        if (data.useAsShipping && shippingAddresses.length === 0) {
          shippingAddresses = [
            {
              id: createId(),
              terminalName: "Registered Office",
              fullAddress: [
                data.addressLine1,
                data.addressLine2,
                `${data.city}, ${data.state} ${data.pincode}`,
                data.country,
              ]
                .filter(Boolean)
                .join(", "),
              contactPerson: state.companyInfo.legalName || "Primary Contact",
              mobileNumber: "+91 9000000000",
            },
          ];
        }

        set({
          businessAddress: data,
          shippingAddresses,
          completedSteps: markStepComplete(
            state.completedSteps,
            "business-address",
          ),
          currentStep: next?.id ?? "shipping-address",
        });
      },

      addShipping: (data) => {
        set({
          shippingAddresses: [
            ...get().shippingAddresses,
            { ...data, id: createId() },
          ],
        });
      },

      updateShipping: (id, data) => {
        set({
          shippingAddresses: get().shippingAddresses.map((addr) =>
            addr.id === id ? { ...addr, ...data } : addr,
          ),
        });
      },

      deleteShipping: (id) => {
        set({
          shippingAddresses: get().shippingAddresses.filter(
            (addr) => addr.id !== id,
          ),
        });
      },

      saveCredit: (docs, creditLimit) => {
        set({
          creditDocuments: docs,
          creditLimit,
          completedSteps: markStepComplete(
            get().completedSteps,
            "credit-eligibility",
          ),
          currentStep: "completion",
        });
      },

      setCreditDocument: (key, doc) => {
        set({
          creditDocuments: {
            ...get().creditDocuments,
            [key]: doc,
          },
        });
      },

      completeOnboarding: () => {
        setOnboardingCompleteCookie(true);
        set({
          isCompleted: true,
          hasStartedOnboarding: true,
          completedSteps: markStepComplete(
            markStepComplete(get().completedSteps, "credit-eligibility"),
            "completion",
          ),
          currentStep: "completion",
        });
      },

      saveDraft: () => {
        set({ draftSavedAt: new Date().toISOString() });
      },

      loadDraft: () => {
        // Persist middleware already hydrates; this is an explicit reload hook
      },

      canAccessStep: (step) => {
        const { completedSteps, isCompleted } = get();
        if (step === "company-information") return true;
        if (step === "completion") {
          return (
            isCompleted ||
            completedSteps.includes("credit-eligibility") ||
            completedSteps.includes("completion")
          );
        }

        const targetIndex = getStepIndex(step);
        if (targetIndex <= 0) return true;

        // Can access if previous step is completed
        const previousSteps = [
          "company-information",
          "gst-verification",
          "business-address",
          "shipping-address",
          "credit-eligibility",
        ] as const;

        const requiredStep = previousSteps[targetIndex - 1];
        return requiredStep ? completedSteps.includes(requiredStep) : false;
      },

      reset: () => {
        setOnboardingCompleteCookie(false);
        set({
          ...initialState,
          isCompleted: false,
          hasStartedOnboarding: true,
          currentStep: "company-information",
          completedSteps: [],
          companyInfo: { ...emptyCompanyInfo },
          gstInfo: { ...emptyGstInfo },
          businessAddress: { ...emptyBusinessAddress },
          shippingAddresses: [],
          creditDocuments: { ...emptyCreditDocuments },
          creditLimit: "",
          draftSavedAt: null,
        });
      },
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        companyInfo: state.companyInfo,
        gstInfo: state.gstInfo,
        businessAddress: state.businessAddress,
        shippingAddresses: state.shippingAddresses,
        creditDocuments: state.creditDocuments,
        creditLimit: state.creditLimit,
        isCompleted: state.isCompleted,
        hasStartedOnboarding: state.hasStartedOnboarding,
        draftSavedAt: state.draftSavedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Legacy sessions without hasStartedOnboarding stay unlocked
        const incomplete =
          state.hasStartedOnboarding === true && state.isCompleted === false;
        setOnboardingCompleteCookie(!incomplete);
      },
    },
  ),
);

/** Mark shipping step complete when at least one address exists */
export function completeShippingStep(): void {
  const store = useOnboardingStore.getState();
  if (store.shippingAddresses.length === 0) return;
  useOnboardingStore.setState({
    completedSteps: markStepComplete(store.completedSteps, "shipping-address"),
    currentStep: "credit-eligibility",
  });
}
