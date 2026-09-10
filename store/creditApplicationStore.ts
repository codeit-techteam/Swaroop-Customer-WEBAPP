"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CREDIT_APPLICATION_STORAGE_KEY,
  CREDIT_DOCUMENT_DEFINITIONS,
  generateCreditApplicationId,
} from "@/mock/credit-application";
import {
  addBusinessDays,
  CREDIT_REVIEW_BUSINESS_DAYS,
  parseCreditLimit,
  requiredDocumentIds,
  validateApplyFields,
  validateUploadFields,
} from "@/lib/credit-application";
import type {
  CreditTermOption,
  CreditWizardStep,
  MonthlyPurchaseBand,
  SubmittedCreditApplication,
  UploadedCreditDocument,
} from "@/types/credit-application";
import type { CreditDocumentId } from "@/types/credit-application";

export interface CreditApplicationStoreState {
  wizardStep: CreditWizardStep;
  requestedLimit: string;
  creditTerm: CreditTermOption;
  monthlyPurchase: MonthlyPurchaseBand | "";
  purpose: string;
  documents: Partial<Record<CreditDocumentId, UploadedCreditDocument>>;
  declarationAccepted: boolean;
  application: SubmittedCreditApplication | null;
  draftSavedAt: string | null;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setRequestedLimit: (value: string) => void;
  setCreditTerm: (value: CreditTermOption) => void;
  setMonthlyPurchase: (value: MonthlyPurchaseBand) => void;
  setPurpose: (value: string) => void;
  setDeclarationAccepted: (value: boolean) => void;
  setDocument: (doc: UploadedCreditDocument) => void;
  removeDocument: (id: CreditDocumentId) => void;
  mergeOnboardingDocuments: (
    docs: Partial<Record<CreditDocumentId, UploadedCreditDocument>>,
  ) => void;
  goToApply: () => void;
  goToUpload: () => { ok: boolean; errors: Record<string, string> };
  saveDraft: () => void;
  submitApplication: () => {
    ok: boolean;
    errors: Record<string, string>;
    application: SubmittedCreditApplication | null;
  };
  isApplyComplete: () => boolean;
  isUploadReady: () => boolean;
}

const emptyDraft = {
  wizardStep: "apply" as CreditWizardStep,
  requestedLimit: "",
  creditTerm: "net_30" as CreditTermOption,
  monthlyPurchase: "" as MonthlyPurchaseBand | "",
  purpose: "",
  documents: {} as Partial<Record<CreditDocumentId, UploadedCreditDocument>>,
  declarationAccepted: false,
  application: null as SubmittedCreditApplication | null,
  draftSavedAt: null as string | null,
};

function stampDraft(): string {
  return new Date().toISOString();
}

export const useCreditApplicationStore = create<CreditApplicationStoreState>()(
  persist(
    (set, get) => ({
      ...emptyDraft,
      isHydrated: false,

      setHydrated: (value) => set({ isHydrated: value }),

      setRequestedLimit: (value) =>
        set({ requestedLimit: value, draftSavedAt: stampDraft() }),

      setCreditTerm: (value) =>
        set({ creditTerm: value, draftSavedAt: stampDraft() }),

      setMonthlyPurchase: (value) =>
        set({ monthlyPurchase: value, draftSavedAt: stampDraft() }),

      setPurpose: (value) =>
        set({ purpose: value, draftSavedAt: stampDraft() }),

      setDeclarationAccepted: (value) =>
        set({ declarationAccepted: value, draftSavedAt: stampDraft() }),

      setDocument: (doc) => {
        const existing = get().documents[doc.id];
        if (existing?.source === "onboarding") return;
        set({
          documents: { ...get().documents, [doc.id]: doc },
          draftSavedAt: stampDraft(),
        });
      },

      removeDocument: (id) => {
        if (get().documents[id]?.source === "onboarding") return;
        const next = { ...get().documents };
        delete next[id];
        set({ documents: next, draftSavedAt: stampDraft() });
      },

      mergeOnboardingDocuments: (docs) => {
        const current = get().documents;
        const next = { ...current };
        let changed = false;
        for (const [id, doc] of Object.entries(docs) as Array<
          [CreditDocumentId, UploadedCreditDocument]
        >) {
          if (!next[id]) {
            next[id] = doc;
            changed = true;
          }
        }
        if (changed) set({ documents: next });
      },

      goToApply: () => {
        if (get().application) return;
        set({ wizardStep: "apply" });
      },

      goToUpload: () => {
        const state = get();
        if (state.application) {
          return { ok: false, errors: {} };
        }
        const errors = validateApplyFields({
          requestedLimit: state.requestedLimit,
          monthlyPurchase: state.monthlyPurchase,
          purpose: state.purpose,
        });
        if (Object.keys(errors).length > 0) {
          return { ok: false, errors };
        }
        set({ wizardStep: "upload", draftSavedAt: stampDraft() });
        return { ok: true, errors: {} };
      },

      saveDraft: () => set({ draftSavedAt: stampDraft() }),

      submitApplication: () => {
        const state = get();
        if (state.application) {
          return { ok: false, errors: {}, application: state.application };
        }

        const applyErrors = validateApplyFields({
          requestedLimit: state.requestedLimit,
          monthlyPurchase: state.monthlyPurchase,
          purpose: state.purpose,
        });
        const uploadErrors = validateUploadFields({
          documents: state.documents,
          declarationAccepted: state.declarationAccepted,
        });
        const errors = { ...applyErrors, ...uploadErrors };
        if (Object.keys(errors).length > 0) {
          return { ok: false, errors, application: null };
        }

        const limit = parseCreditLimit(state.requestedLimit)!;
        const submittedAt = new Date().toISOString();
        const application: SubmittedCreditApplication = {
          applicationId: generateCreditApplicationId(),
          requestedLimit: limit,
          creditTerm: state.creditTerm,
          monthlyPurchase: state.monthlyPurchase as MonthlyPurchaseBand,
          purpose: state.purpose.trim(),
          submittedAt,
          estimatedDecisionBy: addBusinessDays(
            submittedAt,
            CREDIT_REVIEW_BUSINESS_DAYS,
          ),
          status: "pending_review",
          documents: CREDIT_DOCUMENT_DEFINITIONS.filter(
            (def) => state.documents[def.id],
          ).map((def) => ({
            id: def.id,
            title: def.title,
            fileName: state.documents[def.id]!.fileName,
            source: state.documents[def.id]!.source,
          })),
        };

        set({ application, wizardStep: "upload" });
        return { ok: true, errors: {}, application };
      },

      isApplyComplete: () => {
        const state = get();
        return (
          Object.keys(
            validateApplyFields({
              requestedLimit: state.requestedLimit,
              monthlyPurchase: state.monthlyPurchase,
              purpose: state.purpose,
            }),
          ).length === 0
        );
      },

      isUploadReady: () => {
        const state = get();
        const required = requiredDocumentIds();
        return (
          required.every((id) => Boolean(state.documents[id])) &&
          state.declarationAccepted
        );
      },
    }),
    {
      name: CREDIT_APPLICATION_STORAGE_KEY,
      partialize: (state) => ({
        wizardStep: state.wizardStep,
        requestedLimit: state.requestedLimit,
        creditTerm: state.creditTerm,
        monthlyPurchase: state.monthlyPurchase,
        purpose: state.purpose,
        documents: state.documents,
        declarationAccepted: state.declarationAccepted,
        application: state.application,
        draftSavedAt: state.draftSavedAt,
      }),
    },
  ),
);
