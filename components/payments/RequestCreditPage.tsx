"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
import { currentCreditProfileMock } from "@/mock/credit-application";
import {
  CreditApplicationSubmittedView,
  CreditApplicationSuccessModal,
  CreditApplyStep,
  CreditDocumentPreviewModal,
  CreditProcessStepper,
  CreditSidebarCards,
  CreditStatusCard,
  CreditUploadStep,
} from "@/components/payments/credit";
import type {
  CreditApplicationStep,
  UploadedCreditDocument,
} from "@/types/credit-application";
import {
  validateApplyFields,
  validateUploadFields,
} from "@/lib/credit-application";
import {
  countOnboardingProvidedDocuments,
  getOnboardingCreditDocuments,
  listOnboardingProvidedDocIds,
} from "@/lib/credit-onboarding-documents";
import { useCreditApplicationStore } from "@/store/creditApplicationStore";
import { useOnboardingStore } from "@/store/onboardingStore";

export function RequestCreditPage() {
  const profile = currentCreditProfileMock;
  const hasActiveFacility = profile.status === "approved";

  const isHydrated = useCreditApplicationStore((s) => s.isHydrated);
  const wizardStep = useCreditApplicationStore((s) => s.wizardStep);
  const application = useCreditApplicationStore((s) => s.application);
  const requestedLimit = useCreditApplicationStore((s) => s.requestedLimit);
  const monthlyPurchase = useCreditApplicationStore((s) => s.monthlyPurchase);
  const purpose = useCreditApplicationStore((s) => s.purpose);
  const documents = useCreditApplicationStore((s) => s.documents);
  const declarationAccepted = useCreditApplicationStore(
    (s) => s.declarationAccepted,
  );
  const setHydrated = useCreditApplicationStore((s) => s.setHydrated);
  const mergeOnboardingDocuments = useCreditApplicationStore(
    (s) => s.mergeOnboardingDocuments,
  );
  const goToApply = useCreditApplicationStore((s) => s.goToApply);
  const goToUpload = useCreditApplicationStore((s) => s.goToUpload);
  const saveDraft = useCreditApplicationStore((s) => s.saveDraft);
  const submitApplication = useCreditApplicationStore(
    (s) => s.submitApplication,
  );

  const gstInfo = useOnboardingStore((s) => s.gstInfo);
  const creditDocuments = useOnboardingStore((s) => s.creditDocuments);
  const completedSteps = useOnboardingStore((s) => s.completedSteps);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedCreditDocument | null>(
    null,
  );

  useEffect(() => {
    const hydrate = () => {
      const onboarding = useOnboardingStore.getState();
      mergeOnboardingDocuments(getOnboardingCreditDocuments(onboarding));
      setHydrated(true);
    };

    const unsubCredit = useCreditApplicationStore.persist.onFinishHydration(
      () => {
        if (useOnboardingStore.persist.hasHydrated()) hydrate();
      },
    );
    const unsubOnboarding = useOnboardingStore.persist.onFinishHydration(() => {
      if (useCreditApplicationStore.persist.hasHydrated()) hydrate();
    });

    if (
      useCreditApplicationStore.persist.hasHydrated() &&
      useOnboardingStore.persist.hasHydrated()
    ) {
      hydrate();
    }

    const fallback = window.setTimeout(() => {
      if (!useCreditApplicationStore.getState().isHydrated) hydrate();
    }, 1200);

    return () => {
      window.clearTimeout(fallback);
      unsubCredit();
      unsubOnboarding();
    };
  }, [mergeOnboardingDocuments, setHydrated]);

  const onboardingProvidedCount = useMemo(
    () =>
      countOnboardingProvidedDocuments({
        gstInfo,
        creditDocuments,
        completedSteps,
      }),
    [gstInfo, creditDocuments, completedSteps],
  );

  const onboardingProvidedIds = useMemo(
    () =>
      listOnboardingProvidedDocIds({
        gstInfo,
        creditDocuments,
        completedSteps,
      }),
    [gstInfo, creditDocuments, completedSteps],
  );

  const activeStep: CreditApplicationStep = useMemo(() => {
    if (
      application?.status === "approved" ||
      application?.status === "rejected"
    ) {
      return "decision";
    }
    if (application) return "review";
    return wizardStep;
  }, [application, wizardStep]);

  const reachableStep: CreditApplicationStep = useMemo(() => {
    if (application) return activeStep;
    const applyReady =
      Object.keys(
        validateApplyFields({ requestedLimit, monthlyPurchase, purpose }),
      ).length === 0;
    return applyReady ? "upload" : "apply";
  }, [application, activeStep, requestedLimit, monthlyPurchase, purpose]);

  function clearError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleContinue() {
    const result = goToUpload();
    if (!result.ok) {
      setFieldErrors(result.errors);
      toast.error("Complete facility details before uploading documents.");
      return;
    }
    setFieldErrors({});
  }

  function handleStepSelect(step: CreditApplicationStep) {
    if (application) return;
    if (step === "apply") {
      goToApply();
      return;
    }
    if (step === "upload") {
      handleContinue();
    }
  }

  function handleSubmit() {
    const applyErrors = validateApplyFields({
      requestedLimit,
      monthlyPurchase,
      purpose,
    });
    const uploadErrors = validateUploadFields({
      documents,
      declarationAccepted,
    });
    const errors = { ...applyErrors, ...uploadErrors };

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (Object.keys(applyErrors).length > 0) {
        goToApply();
        toast.error("Facility details need attention before submit.");
        return;
      }
      toast.error("Upload required documents and accept the declaration.");
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      const result = submitApplication();
      setSubmitting(false);
      if (!result.ok) {
        setFieldErrors(result.errors);
        toast.error(
          "Could not submit the application. Please review the form.",
        );
        return;
      }
      setSuccessOpen(true);
    }, 800);
  }

  if (!isHydrated) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </PageContainer>
    );
  }

  const showWizard = !application;

  return (
    <PageContainer>
      <PageHeader
        title="Request Trading Credit"
        description={
          hasActiveFacility
            ? "Request additional credit or revised payment terms. Your current facility stays active while this application is reviewed."
            : "Apply for a PetroTrade credit facility to purchase materials on Net-15 or Net-30 terms. Your application is reviewed before approval."
        }
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Request Credit" },
        ]}
      />

      <CardStepperShell>
        <CreditProcessStepper
          activeStep={activeStep}
          reachableStep={reachableStep}
          onStepSelect={showWizard ? handleStepSelect : undefined}
        />
      </CardStepperShell>

      <CreditStatusCard
        status={profile.status}
        approvedLimit={profile.approvedLimit}
        availableCredit={profile.availableCredit}
        creditUsed={profile.creditUsed}
        paymentTerms={profile.paymentTerms}
        compact={hasActiveFacility}
        className="mb-4"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {application ? (
            <CreditApplicationSubmittedView
              application={application}
              hasActiveFacility={hasActiveFacility}
            />
          ) : (
            <motion.div
              key={wizardStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {wizardStep === "apply" ? (
                <CreditApplyStep
                  fieldErrors={fieldErrors}
                  onClearError={clearError}
                  onContinue={handleContinue}
                  onSaveDraft={saveDraft}
                  hasActiveFacility={hasActiveFacility}
                />
              ) : (
                <CreditUploadStep
                  fieldErrors={fieldErrors}
                  onClearError={clearError}
                  onBack={goToApply}
                  onSaveDraft={saveDraft}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  onboardingProvidedCount={onboardingProvidedCount}
                  onboardingProvidedIds={onboardingProvidedIds}
                  onPreview={setPreviewDoc}
                />
              )}
            </motion.div>
          )}
        </div>

        <CreditSidebarCards className="lg:sticky lg:top-24 lg:self-start" />
      </div>

      <CreditDocumentPreviewModal
        document={previewDoc}
        open={Boolean(previewDoc)}
        onOpenChange={(open) => {
          if (!open) setPreviewDoc(null);
        }}
      />

      {application ? (
        <CreditApplicationSuccessModal
          open={successOpen}
          applicationId={application.applicationId}
          onViewStatus={() => setSuccessOpen(false)}
          onOpenChange={setSuccessOpen}
        />
      ) : null}
    </PageContainer>
  );
}

function CardStepperShell({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
      {children}
    </div>
  );
}
