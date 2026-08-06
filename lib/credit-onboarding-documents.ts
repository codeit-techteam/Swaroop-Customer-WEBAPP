import type {
  CreditDocumentId,
  UploadedCreditDocument,
} from "@/types/credit-application";
import type { OnboardingState } from "@/types/onboarding";

/** Estimated size when onboarding only stores filename (no binary). */
const ONBOARDING_PLACEHOLDER_BYTES = 2_400_000;

type OnboardingDocSlice = Pick<
  OnboardingState,
  "gstInfo" | "creditDocuments" | "completedSteps"
>;

function onboardingDoc(
  id: CreditDocumentId,
  fileName: string,
  uploadedAt: string,
  fileSizeBytes = ONBOARDING_PLACEHOLDER_BYTES,
): UploadedCreditDocument {
  return {
    id,
    fileName,
    fileSizeBytes,
    uploadedAt,
    source: "onboarding",
  };
}

/**
 * Maps documents collected during customer onboarding to credit-application slots.
 * Returns only documents that were actually provided in the onboarding wizard.
 */
export function getOnboardingCreditDocuments(
  onboarding: OnboardingDocSlice,
): Partial<Record<CreditDocumentId, UploadedCreditDocument>> {
  const result: Partial<Record<CreditDocumentId, UploadedCreditDocument>> = {};
  const { gstInfo, creditDocuments } = onboarding;

  if (gstInfo.certificateFileName) {
    result.gst_registration = onboardingDoc(
      "gst_registration",
      gstInfo.certificateFileName,
      creditDocuments.bankStatements?.uploadedAt ??
        creditDocuments.itr?.uploadedAt ??
        new Date().toISOString(),
    );
  }

  if (gstInfo.isVerified && gstInfo.verification?.pan) {
    result.pan_card = onboardingDoc(
      "pan_card",
      `PAN_${gstInfo.verification.pan}_verified.pdf`,
      creditDocuments.bankStatements?.uploadedAt ?? new Date().toISOString(),
      512_000,
    );
  }

  if (creditDocuments.bankStatements?.fileName) {
    result.bank_statement = onboardingDoc(
      "bank_statement",
      creditDocuments.bankStatements.fileName,
      creditDocuments.bankStatements.uploadedAt,
    );
  }

  if (creditDocuments.itr?.fileName) {
    result.itr_financials = onboardingDoc(
      "itr_financials",
      creditDocuments.itr.fileName,
      creditDocuments.itr.uploadedAt,
    );
  }

  return result;
}

export function listOnboardingProvidedDocIds(
  onboarding: OnboardingDocSlice,
): CreditDocumentId[] {
  return Object.keys(
    getOnboardingCreditDocuments(onboarding),
  ) as CreditDocumentId[];
}

export function countOnboardingProvidedDocuments(
  onboarding: OnboardingDocSlice,
): number {
  return listOnboardingProvidedDocIds(onboarding).length;
}
