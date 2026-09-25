"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import {
  CREDIT_APPLICATION_STORAGE_KEY,
  CREDIT_DOCUMENT_DEFINITIONS,
} from "@/mock/credit-application";
import {
  createCreditApplicationDocument,
  creditApiError,
  fetchCustomerCreditSummary,
  fetchLatestCreditApplication,
  putCreditDocumentFile,
  replaceCreditApplicationDocument,
  resolveCreditDocumentMime,
  resubmitCreditApplicationDocuments,
  saveCreditApplicationDraft,
  submitCreditApplication,
  type CreditDocumentCreated,
} from "@/services/credit";
import {
  canEditCreditDocuments,
  creditTermFromTenureDays,
  parseCreditLimit,
  requiredDocumentIds,
  tenureDaysForTerm,
  validateApplyFields,
  validateUploadFields,
} from "@/lib/credit-application";
import type {
  CreditAccountSnapshot,
  CreditApplicationDocument,
  CreditApplicationView,
  CreditDocumentId,
  CreditTermOption,
  CreditWizardStep,
  MonthlyPurchaseBand,
  UploadedCreditDocument,
} from "@/types/credit-application";

type DocumentMap = Partial<Record<CreditDocumentId, UploadedCreditDocument>>;
type DocumentIdMap = Partial<Record<CreditDocumentId, string>>;
type SlotErrorMap = Partial<Record<CreditDocumentId, string>>;

export type CreditMutationResult = {
  ok: boolean;
  errors: Record<string, string>;
};

export interface CreditApplicationStoreState {
  /** Draft form fields — the only slice persisted locally. */
  wizardStep: CreditWizardStep;
  requestedLimit: string;
  creditTerm: CreditTermOption;
  monthlyPurchase: MonthlyPurchaseBand | "";
  purpose: string;
  declarationAccepted: boolean;
  draftSavedAt: string | null;

  /** Backend truth — never persisted. */
  application: CreditApplicationView | null;
  account: CreditAccountSnapshot | null;
  displayStatus: string | null;
  documents: DocumentMap;
  /** Storage document id per slot, retained after a local clear so re-upload replaces. */
  documentIds: DocumentIdMap;
  documentErrors: SlotErrorMap;
  storageConfigured: boolean;

  isHydrated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  loadError: string | null;
  savingDraft: boolean;
  uploadingSlots: CreditDocumentId[];
  submitting: boolean;
  resubmitting: boolean;

  setRequestedLimit: (value: string) => void;
  setCreditTerm: (value: CreditTermOption) => void;
  setMonthlyPurchase: (value: MonthlyPurchaseBand) => void;
  setPurpose: (value: string) => void;
  setDeclarationAccepted: (value: boolean) => void;

  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;

  goToApply: () => void;
  continueToUpload: () => Promise<CreditMutationResult>;
  saveDraft: () => Promise<CreditMutationResult>;

  uploadDocument: (
    slot: CreditDocumentId,
    file: File,
    onProgress?: (percent: number) => void,
  ) => Promise<void>;
  clearDocumentSlot: (slot: CreditDocumentId) => void;

  submitApplication: () => Promise<{
    ok: boolean;
    errors: Record<string, string>;
    applicationNumber: string | null;
  }>;
  resubmitDocuments: (message?: string) => Promise<void>;

  isApplyComplete: () => boolean;
  isUploadReady: () => boolean;
}

const DRAFT_DEFAULTS = {
  wizardStep: "apply" as CreditWizardStep,
  requestedLimit: "",
  creditTerm: "net_30" as CreditTermOption,
  monthlyPurchase: "" as MonthlyPurchaseBand | "",
  purpose: "",
  declarationAccepted: false,
  draftSavedAt: null as string | null,
};

const SLOT_IDS = new Set<string>(
  CREDIT_DOCUMENT_DEFINITIONS.map((def) => def.id),
);

function isSlotId(value: string): value is CreditDocumentId {
  return SLOT_IDS.has(value);
}

function toNumber(value: string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toUploadedDocument(
  slot: CreditDocumentId,
  doc: CreditApplicationDocument | CreditDocumentCreated,
): UploadedCreditDocument {
  return {
    id: slot,
    documentId: doc.id,
    fileName: doc.fileName,
    fileSizeBytes: toNumber(doc.fileSizeBytes),
    uploadedAt: doc.updatedAt ?? doc.createdAt ?? new Date().toISOString(),
    status: doc.status,
    rejectionReason: doc.rejectionReason ?? null,
    storagePending: Boolean(doc.storagePending),
    version: doc.version,
    source: "application",
  };
}

/**
 * Backend documents are newest-first; the first entry per slot wins. Rejected
 * documents stay out of `documents` so validation still demands a re-upload,
 * but their id is kept so the next upload becomes a replace.
 */
function projectDocuments(application: CreditApplicationView | null): {
  documents: DocumentMap;
  documentIds: DocumentIdMap;
  documentErrors: SlotErrorMap;
} {
  const documents: DocumentMap = {};
  const documentIds: DocumentIdMap = {};
  const documentErrors: SlotErrorMap = {};
  if (!application) return { documents, documentIds, documentErrors };

  for (const doc of application.documents ?? []) {
    if (!isSlotId(doc.documentType)) continue;
    const slot = doc.documentType;
    if (documentIds[slot]) continue;

    documentIds[slot] = doc.id;
    if (doc.status === "REJECTED") {
      documentErrors[slot] =
        doc.rejectionReason ??
        "Rejected by the credit desk. Upload a new file.";
      continue;
    }
    if (doc.status === "ARCHIVED" || doc.status === "REPLACED") continue;
    documents[slot] = toUploadedDocument(slot, doc);
  }

  return { documents, documentIds, documentErrors };
}

function stamp(): string {
  return new Date().toISOString();
}

export const useCreditApplicationStore = create<CreditApplicationStoreState>()(
  persist(
    (set, get) => ({
      ...DRAFT_DEFAULTS,

      application: null,
      account: null,
      displayStatus: null,
      documents: {},
      documentIds: {},
      documentErrors: {},
      storageConfigured: true,

      isHydrated: false,
      isLoading: false,
      isRefreshing: false,
      loadError: null,
      savingDraft: false,
      uploadingSlots: [],
      submitting: false,
      resubmitting: false,

      setRequestedLimit: (value) => set({ requestedLimit: value }),
      setCreditTerm: (value) => set({ creditTerm: value }),
      setMonthlyPurchase: (value) => set({ monthlyPurchase: value }),
      setPurpose: (value) => set({ purpose: value }),
      setDeclarationAccepted: (value) => set({ declarationAccepted: value }),

      hydrate: async () => {
        if (get().isLoading) return;
        set({ isLoading: true, loadError: null });
        try {
          await applyServerState(set, get);
          set({ isLoading: false, isHydrated: true });
        } catch (error) {
          set({
            isLoading: false,
            isHydrated: true,
            loadError: creditApiError(
              error,
              "Unable to load your credit application.",
            ),
          });
        }
      },

      refresh: async () => {
        if (get().isRefreshing) return;
        set({ isRefreshing: true });
        try {
          await applyServerState(set, get);
          set({ isRefreshing: false, loadError: null });
        } catch (error) {
          set({
            isRefreshing: false,
            loadError: creditApiError(
              error,
              "Unable to refresh credit status.",
            ),
          });
        }
      },

      goToApply: () => {
        const status = get().application?.status;
        if (status && status !== "DRAFT") return;
        set({ wizardStep: "apply" });
      },

      continueToUpload: async (): Promise<CreditMutationResult> => {
        const state = get();
        const errors = validateApplyFields({
          requestedLimit: state.requestedLimit,
          monthlyPurchase: state.monthlyPurchase,
          purpose: state.purpose,
        });
        if (Object.keys(errors).length > 0) return { ok: false, errors };

        try {
          await persistDraft(set, get);
          set({ wizardStep: "upload" });
          return { ok: true, errors: {} };
        } catch (error) {
          const message = creditApiError(
            error,
            "Unable to save your credit application draft.",
          );
          toast.error(message);
          return { ok: false, errors: { form: message } };
        }
      },

      saveDraft: async (): Promise<CreditMutationResult> => {
        const state = get();
        if (state.application && state.application.status !== "DRAFT") {
          return { ok: true, errors: {} };
        }
        if (parseCreditLimit(state.requestedLimit) == null) {
          return {
            ok: false,
            errors: {
              requestedLimit: "Enter a requested credit limit to save a draft.",
            },
          };
        }
        try {
          await persistDraft(set, get);
          return { ok: true, errors: {} };
        } catch (error) {
          const message = creditApiError(
            error,
            "Unable to save your credit application draft.",
          );
          return { ok: false, errors: { form: message } };
        }
      },

      uploadDocument: async (slot, file, onProgress) => {
        const state = get();
        let application = state.application;

        if (!application) {
          application = await persistDraft(set, get);
        }
        if (!application) {
          throw new Error(
            "Save your facility details before uploading documents.",
          );
        }
        if (!canEditCreditDocuments(application.status)) {
          throw new Error(
            "Documents cannot be changed while the application is under review.",
          );
        }

        const applicationId = application.id;
        const mimeType = resolveCreditDocumentMime(file);
        const existingDocumentId = get().documentIds[slot];

        set({ uploadingSlots: [...new Set([...get().uploadingSlots, slot])] });
        try {
          const created = existingDocumentId
            ? await replaceCreditApplicationDocument(
                applicationId,
                existingDocumentId,
                {
                  fileName: file.name,
                  mimeType,
                  fileSizeBytes: file.size,
                },
              )
            : await createCreditApplicationDocument(applicationId, {
                documentType: slot,
                fileName: file.name,
                mimeType,
                fileSizeBytes: file.size,
              });

          const storageConfigured = created.storageConfigured !== false;
          if (created.uploadUrl) {
            await putCreditDocumentFile(
              created.uploadUrl,
              file,
              mimeType,
              onProgress,
            );
          } else {
            // Metadata is recorded; R2 was not configured / no signed URL issued.
            onProgress?.(100);
            toast.warning(
              "Document recorded, but file storage is unavailable. You can continue — the credit desk may request a re-upload.",
            );
          }

          const nextErrors = { ...get().documentErrors };
          delete nextErrors[slot];

          set({
            documents: {
              ...get().documents,
              [slot]: {
                ...toUploadedDocument(slot, created),
                fileSizeBytes: file.size,
                storagePending: !created.uploadUrl,
              },
            },
            documentIds: { ...get().documentIds, [slot]: created.id },
            documentErrors: nextErrors,
            storageConfigured: storageConfigured && Boolean(created.uploadUrl),
            draftSavedAt: stamp(),
          });
        } finally {
          set({
            uploadingSlots: get().uploadingSlots.filter((id) => id !== slot),
          });
        }
      },

      clearDocumentSlot: (slot) => {
        const documents = { ...get().documents };
        delete documents[slot];
        const documentErrors = { ...get().documentErrors };
        delete documentErrors[slot];
        set({ documents, documentErrors });
      },

      submitApplication: async () => {
        const state = get();
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
          return { ok: false, errors, applicationNumber: null };
        }

        set({ submitting: true });
        try {
          const application =
            (await persistDraft(set, get)) ?? get().application;
          if (!application) {
            throw new Error(
              "Credit application draft is missing. Please retry.",
            );
          }

          const result = await submitCreditApplication(application.id);
          await applyServerState(set, get);
          return {
            ok: true,
            errors: {},
            applicationNumber: result.applicationNumber,
          };
        } finally {
          set({ submitting: false });
        }
      },

      resubmitDocuments: async (message) => {
        const application = get().application;
        if (!application) throw new Error("No credit application to resubmit.");
        set({ resubmitting: true });
        try {
          await resubmitCreditApplicationDocuments(application.id, message);
          await applyServerState(set, get);
        } finally {
          set({ resubmitting: false });
        }
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
        return (
          requiredDocumentIds().every((id) => Boolean(state.documents[id])) &&
          state.declarationAccepted
        );
      },
    }),
    {
      name: CREDIT_APPLICATION_STORAGE_KEY,
      // Only the unsubmitted draft form survives a reload; status always
      // comes from the backend on mount.
      partialize: (state) => ({
        wizardStep: state.wizardStep,
        requestedLimit: state.requestedLimit,
        creditTerm: state.creditTerm,
        monthlyPurchase: state.monthlyPurchase,
        purpose: state.purpose,
        declarationAccepted: state.declarationAccepted,
        draftSavedAt: state.draftSavedAt,
      }),
    },
  ),
);

type SetState = (partial: Partial<CreditApplicationStoreState>) => void;
type GetState = () => CreditApplicationStoreState;

/** Pull summary + latest application and rebuild every derived slice. */
async function applyServerState(set: SetState, get: GetState): Promise<void> {
  const [summary, application] = await Promise.all([
    fetchCustomerCreditSummary().catch(() => null),
    fetchLatestCreditApplication(),
  ]);

  const projected = projectDocuments(application);
  const account = application?.account ?? summary?.account ?? null;
  const draft = seedDraftFromApplication(get(), application);

  set({
    application,
    account,
    displayStatus: summary?.status ?? null,
    ...projected,
    storageConfigured: application?.storage?.configured ?? true,
    wizardStep: resolveWizardStep(
      get().wizardStep,
      application,
      projected.documents,
    ),
    ...draft,
  });
}

/** Keep the form aligned with the server draft without clobbering local edits. */
function seedDraftFromApplication(
  state: CreditApplicationStoreState,
  application: CreditApplicationView | null,
): Partial<CreditApplicationStoreState> {
  if (!application) return {};
  const seeded: Partial<CreditApplicationStoreState> = {};

  if (!state.requestedLimit) {
    const limit = Number(application.requestedLimit);
    if (Number.isFinite(limit) && limit > 0) {
      seeded.requestedLimit = Math.round(limit).toLocaleString("en-IN");
    }
  }
  if (!state.purpose && application.purpose) {
    seeded.purpose = application.purpose;
  }
  if (application.requestedTenureDays != null) {
    seeded.creditTerm = creditTermFromTenureDays(
      application.requestedTenureDays,
    );
  }
  if (application.status !== "DRAFT") {
    seeded.declarationAccepted = true;
  }
  return seeded;
}

function resolveWizardStep(
  current: CreditWizardStep,
  application: CreditApplicationView | null,
  documents: DocumentMap,
): CreditWizardStep {
  if (!application) return current;
  if (application.status === "DOCUMENTS_REQUIRED") return "upload";
  if (application.status !== "DRAFT") return current;
  const hasUpload = Object.keys(documents).length > 0;
  return hasUpload ? "upload" : current;
}

/** Create or update the backend DRAFT from the current form values. */
async function persistDraft(
  set: SetState,
  get: GetState,
): Promise<CreditApplicationView | null> {
  const state = get();
  if (state.application && state.application.status !== "DRAFT") {
    return state.application;
  }

  const limit = parseCreditLimit(state.requestedLimit);
  if (limit == null) return state.application;

  set({ savingDraft: true });
  try {
    const application = await saveCreditApplicationDraft({
      requestedLimit: limit,
      requestedTenureDays: tenureDaysForTerm(state.creditTerm),
      purpose: state.purpose.trim() || undefined,
      metadata: state.monthlyPurchase
        ? { monthlyPurchase: state.monthlyPurchase }
        : undefined,
    });

    const projected = projectDocuments(application);
    set({
      application,
      account: application.account ?? get().account,
      storageConfigured: application.storage?.configured ?? true,
      documentIds: { ...projected.documentIds, ...get().documentIds },
      draftSavedAt: stamp(),
    });
    return application;
  } finally {
    set({ savingDraft: false });
  }
}
