"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/constants";
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
  creditAccountStatusFor,
  creditPaymentTermsLabel,
  creditStepForStatus,
  isTerminalCreditStatus,
  validateApplyFields,
  validateUploadFields,
} from "@/lib/credit-application";
import { creditApiError } from "@/services/credit";
import { useCreditApplicationStore } from "@/store/creditApplicationStore";
import { useCreditStore } from "@/store/creditStore";
import { CreditPageSkeleton } from "@/components/credit/credit-page-skeleton";

const POLL_INTERVAL_MS = 45_000;

export function RequestCreditPage() {
  const fetchCreditLimit = useCreditStore((s) => s.fetchFromApi);
  const creditSummary = useCreditStore((s) => s.creditSummary);

  const isHydrated = useCreditApplicationStore((s) => s.isHydrated);
  const isLoading = useCreditApplicationStore((s) => s.isLoading);
  const loadError = useCreditApplicationStore((s) => s.loadError);
  const wizardStep = useCreditApplicationStore((s) => s.wizardStep);
  const application = useCreditApplicationStore((s) => s.application);
  const account = useCreditApplicationStore((s) => s.account);
  const displayStatus = useCreditApplicationStore((s) => s.displayStatus);
  const requestedLimit = useCreditApplicationStore((s) => s.requestedLimit);
  const monthlyPurchase = useCreditApplicationStore((s) => s.monthlyPurchase);
  const purpose = useCreditApplicationStore((s) => s.purpose);
  const submitting = useCreditApplicationStore((s) => s.submitting);
  const resubmitting = useCreditApplicationStore((s) => s.resubmitting);
  const savingDraft = useCreditApplicationStore((s) => s.savingDraft);

  const hydrate = useCreditApplicationStore((s) => s.hydrate);
  const refresh = useCreditApplicationStore((s) => s.refresh);
  const goToApply = useCreditApplicationStore((s) => s.goToApply);
  const continueToUpload = useCreditApplicationStore((s) => s.continueToUpload);
  const saveDraft = useCreditApplicationStore((s) => s.saveDraft);
  const submitApplication = useCreditApplicationStore(
    (s) => s.submitApplication,
  );
  const resubmitDocuments = useCreditApplicationStore(
    (s) => s.resubmitDocuments,
  );

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [submittedApplicationNumber, setSubmittedApplicationNumber] = useState<
    string | null
  >(null);
  const [previewDoc, setPreviewDoc] = useState<UploadedCreditDocument | null>(
    null,
  );

  useEffect(() => {
    void hydrate();
    void fetchCreditLimit();
  }, [hydrate, fetchCreditLimit]);

  const appStatus = application?.status ?? null;
  const needsDocumentResubmit = appStatus === "DOCUMENTS_REQUIRED";
  const showWizard = !application || appStatus === "DRAFT";
  const showStatusView =
    Boolean(application) && !showWizard && !needsDocumentResubmit;
  const statusIsTerminal = appStatus ? isTerminalCreditStatus(appStatus) : true;

  // Soft-poll + focus refetch while a non-terminal status view is open.
  useEffect(() => {
    if (!showStatusView || !application || statusIsTerminal) return undefined;

    const onFocus = () => {
      void refresh();
    };
    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_INTERVAL_MS);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, [showStatusView, application, statusIsTerminal, refresh]);

  const approvedLimit = useMemo(() => {
    if (account?.approvedLimit != null) {
      const n = Number(account.approvedLimit);
      if (Number.isFinite(n)) return n;
    }
    return creditSummary.creditLimit;
  }, [account?.approvedLimit, creditSummary.creditLimit]);

  const availableCredit = useMemo(() => {
    if (account?.availableLimit != null) {
      const n = Number(account.availableLimit);
      if (Number.isFinite(n)) return n;
    }
    return creditSummary.availableCredit;
  }, [account?.availableLimit, creditSummary.availableCredit]);

  const creditUsed = useMemo(() => {
    if (account?.utilizedAmount != null) {
      const n = Number(account.utilizedAmount);
      if (Number.isFinite(n)) return n;
    }
    return Math.max(0, approvedLimit - availableCredit);
  }, [account?.utilizedAmount, approvedLimit, availableCredit]);

  const hasActiveFacility = approvedLimit > 0;
  const statusCardStatus = creditAccountStatusFor(displayStatus, appStatus);
  const paymentTerms = creditPaymentTermsLabel(account?.creditTermDays);

  const activeStep: CreditApplicationStep = useMemo(() => {
    if (showWizard) return wizardStep;
    if (needsDocumentResubmit) return "upload";
    if (application) return creditStepForStatus(application.status);
    return wizardStep;
  }, [showWizard, wizardStep, needsDocumentResubmit, application]);

  const reachableStep: CreditApplicationStep = useMemo(() => {
    if (!showWizard) return activeStep;
    const applyReady =
      Object.keys(
        validateApplyFields({ requestedLimit, monthlyPurchase, purpose }),
      ).length === 0;
    return applyReady ? "upload" : "apply";
  }, [showWizard, activeStep, requestedLimit, monthlyPurchase, purpose]);

  function clearError(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const handleContinue = useCallback(async () => {
    const result = await continueToUpload();
    if (!result.ok) {
      setFieldErrors(result.errors);
      toast.error("Complete facility details before uploading documents.");
      return;
    }
    setFieldErrors({});
  }, [continueToUpload]);

  const handleSaveDraft = useCallback(async () => {
    const result = await saveDraft();
    if (!result.ok) {
      setFieldErrors(result.errors);
      toast.error(
        result.errors.requestedLimit ??
          result.errors.form ??
          "Unable to save draft.",
      );
      return;
    }
    toast.success("Draft saved. You can continue later.");
  }, [saveDraft]);

  function handleStepSelect(step: CreditApplicationStep) {
    if (!showWizard) return;
    if (step === "apply") {
      goToApply();
      return;
    }
    if (step === "upload") {
      void handleContinue();
    }
  }

  async function handleSubmit() {
    try {
      const result = await submitApplication();
      if (!result.ok) {
        setFieldErrors(result.errors);
        if (
          result.errors.requestedLimit ||
          result.errors.monthlyPurchase ||
          result.errors.purpose
        ) {
          goToApply();
          toast.error("Facility details need attention before submit.");
          return;
        }
        toast.error("Upload required documents and accept the declaration.");
        return;
      }
      setSubmittedApplicationNumber(result.applicationNumber);
      setSuccessOpen(true);
      setFieldErrors({});
    } catch (error) {
      toast.error(
        creditApiError(error, "Unable to submit credit application."),
      );
    }
  }

  async function handleResubmit() {
    const state = useCreditApplicationStore.getState();
    const allUploadErrors = validateUploadFields({
      documents: state.documents,
      declarationAccepted: true,
    });
    const uploadErrors = Object.fromEntries(
      Object.entries(allUploadErrors).filter(([key]) => key.startsWith("doc_")),
    );
    if (Object.keys(uploadErrors).length > 0) {
      setFieldErrors(uploadErrors);
      toast.error("Upload the required documents before resubmitting.");
      return;
    }

    try {
      await resubmitDocuments();
      toast.success("Documents resubmitted for review.");
      setFieldErrors({});
    } catch (error) {
      toast.error(
        creditApiError(
          error,
          "Unable to resubmit documents. Please try again.",
        ),
      );
    }
  }

  if (!isHydrated || isLoading) {
    return (
      <PageContainer>
        <CreditPageSkeleton />
      </PageContainer>
    );
  }

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

      {loadError ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>{loadError}</p>
            <button
              type="button"
              className="mt-1 text-sm font-semibold text-brand underline"
              onClick={() => void hydrate()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <CardStepperShell>
        <CreditProcessStepper
          activeStep={activeStep}
          reachableStep={reachableStep}
          onStepSelect={showWizard ? handleStepSelect : undefined}
        />
      </CardStepperShell>

      <CreditStatusCard
        status={statusCardStatus}
        approvedLimit={approvedLimit}
        availableCredit={availableCredit}
        creditUsed={creditUsed}
        paymentTerms={paymentTerms}
        compact={hasActiveFacility}
        className="mb-4"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {showStatusView && application ? (
            <CreditApplicationSubmittedView
              application={application}
              monthlyPurchase={monthlyPurchase}
              hasActiveFacility={hasActiveFacility}
            />
          ) : needsDocumentResubmit ? (
            <CreditUploadStep
              fieldErrors={fieldErrors}
              onClearError={clearError}
              onBack={goToApply}
              onSaveDraft={handleSaveDraft}
              onSubmit={() => void handleResubmit()}
              submitting={resubmitting}
              onPreview={setPreviewDoc}
              submitLabel="Resubmit documents"
              showBack={false}
              showSaveDraft={false}
              showDeclaration={false}
              notice={
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Documents required</p>
                    <p className="mt-0.5 text-amber-800/90">
                      {application?.customerMessage ??
                        "The credit desk needs updated documents. Upload the requested files and resubmit."}
                    </p>
                    {application?.missingDocuments?.length ? (
                      <ul className="mt-2 list-disc pl-4 text-xs">
                        {application.missingDocuments.map((doc) => (
                          <li key={doc.documentType}>{doc.label}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              }
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
                  onContinue={() => void handleContinue()}
                  onSaveDraft={() => void handleSaveDraft()}
                  hasActiveFacility={hasActiveFacility}
                  saving={savingDraft}
                />
              ) : (
                <CreditUploadStep
                  fieldErrors={fieldErrors}
                  onClearError={clearError}
                  onBack={goToApply}
                  onSaveDraft={handleSaveDraft}
                  onSubmit={() => void handleSubmit()}
                  submitting={submitting || savingDraft}
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

      <CreditApplicationSuccessModal
        open={successOpen}
        applicationId={
          submittedApplicationNumber ?? application?.applicationNumber ?? ""
        }
        onViewStatus={() => setSuccessOpen(false)}
        onOpenChange={setSuccessOpen}
      />
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
