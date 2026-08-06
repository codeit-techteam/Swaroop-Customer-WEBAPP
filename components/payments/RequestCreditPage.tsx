"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IndianRupee, Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants";
import {
  CREDIT_DOCUMENT_DEFINITIONS,
  MONTHLY_PURCHASE_OPTIONS,
  currentCreditProfileMock,
  generateCreditApplicationId,
} from "@/mock/credit-application";
import {
  CreditApplicationSubmittedView,
  CreditApplicationSuccessModal,
  CreditDocumentPreviewModal,
  CreditDocumentUploadCard,
  CreditProcessStepper,
  CreditSidebarCards,
  CreditStatusCard,
} from "@/components/payments/credit";
import type {
  CreditApplicationStep,
  CreditDocumentId,
  CreditTermOption,
  MonthlyPurchaseBand,
  SubmittedCreditApplication,
  UploadedCreditDocument,
} from "@/types/credit-application";
import {
  countOnboardingProvidedDocuments,
  getOnboardingCreditDocuments,
  listOnboardingProvidedDocIds,
} from "@/lib/credit-onboarding-documents";
import { useOnboardingStore } from "@/store/onboardingStore";
import { cn } from "@/lib/utils";

const REQUIRED_DOC_IDS = CREDIT_DOCUMENT_DEFINITIONS.filter(
  (d) => d.required,
).map((d) => d.id);

function parseCreditLimit(value: string): number | null {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}

function formatLimitInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-IN");
}

export function RequestCreditPage() {
  const router = useRouter();
  const profile = currentCreditProfileMock;

  const [view, setView] = useState<"form" | "submitted">("form");
  const [requestedLimit, setRequestedLimit] = useState("");
  const [creditTerm, setCreditTerm] = useState<CreditTermOption>("net_30");
  const [monthlyPurchase, setMonthlyPurchase] = useState<
    MonthlyPurchaseBand | ""
  >("");
  const [purpose, setPurpose] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [documents, setDocuments] = useState<
    Partial<Record<CreditDocumentId, UploadedCreditDocument>>
  >({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedCreditDocument | null>(
    null,
  );
  const [application, setApplication] =
    useState<SubmittedCreditApplication | null>(null);

  const gstInfo = useOnboardingStore((s) => s.gstInfo);
  const creditDocuments = useOnboardingStore((s) => s.creditDocuments);
  const completedSteps = useOnboardingStore((s) => s.completedSteps);

  useEffect(() => {
    const hydrateFromOnboarding = () => {
      const state = useOnboardingStore.getState();
      const prefilled = getOnboardingCreditDocuments(state);
      setDocuments((prev) => {
        const next = { ...prev };
        for (const [id, doc] of Object.entries(prefilled) as Array<
          [CreditDocumentId, UploadedCreditDocument]
        >) {
          if (!next[id]) next[id] = doc;
        }
        return next;
      });
    };

    const unsub = useOnboardingStore.persist.onFinishHydration(
      hydrateFromOnboarding,
    );
    if (useOnboardingStore.persist.hasHydrated()) hydrateFromOnboarding();
    return unsub;
  }, []);

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

  const onboardingDocDefs = useMemo(
    () =>
      CREDIT_DOCUMENT_DEFINITIONS.filter((d) =>
        onboardingProvidedIds.includes(d.id),
      ),
    [onboardingProvidedIds],
  );

  const remainingDocDefs = useMemo(
    () =>
      CREDIT_DOCUMENT_DEFINITIONS.filter(
        (d) => !onboardingProvidedIds.includes(d.id),
      ),
    [onboardingProvidedIds],
  );

  const activeStep: CreditApplicationStep = useMemo(() => {
    if (view === "submitted") return "review";
    const requiredUploaded = REQUIRED_DOC_IDS.every((id) => documents[id]);
    return requiredUploaded ? "upload" : "apply";
  }, [view, documents]);

  const canSubmit = useMemo(() => {
    const limit = parseCreditLimit(requestedLimit);
    const allRequired = REQUIRED_DOC_IDS.every((id) => documents[id]);
    return Boolean(limit && limit > 0 && allRequired && declarationAccepted);
  }, [requestedLimit, documents, declarationAccepted]);

  function handleUpload(id: CreditDocumentId, file: File) {
    if (documents[id]?.source === "onboarding") return;
    setDocuments((prev) => ({
      ...prev,
      [id]: {
        id,
        fileName: file.name,
        fileSizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        source: "application",
      },
    }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`doc_${id}`];
      return next;
    });
  }

  function handleRemove(id: CreditDocumentId) {
    if (documents[id]?.source === "onboarding") return;
    setDocuments((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    const limit = parseCreditLimit(requestedLimit);

    if (!limit || limit <= 0) {
      errors.requestedLimit = "Enter a valid requested credit limit.";
    }
    if (!monthlyPurchase) {
      errors.monthlyPurchase = "Select expected monthly purchase volume.";
    }
    if (!purpose.trim()) {
      errors.purpose = "Describe why you require trading credit.";
    }
    if (!declarationAccepted) {
      errors.declaration = "You must accept the declaration to proceed.";
    }

    for (const id of REQUIRED_DOC_IDS) {
      if (!documents[id]) {
        const def = CREDIT_DOCUMENT_DEFINITIONS.find((d) => d.id === id);
        errors[`doc_${id}`] = `${def?.title ?? "Document"} is required.`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const limit = parseCreditLimit(requestedLimit)!;
    setSubmitting(true);

    window.setTimeout(() => {
      const submitted: SubmittedCreditApplication = {
        applicationId: generateCreditApplicationId(),
        requestedLimit: limit,
        creditTerm,
        submittedAt: new Date().toISOString(),
        status: "pending_review",
      };
      setApplication(submitted);
      setSubmitting(false);
      setSuccessOpen(true);
    }, 900);
  }

  function handleViewStatus() {
    setView("submitted");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Request Trading Credit"
        description="Apply for a PetroTrade credit facility to purchase materials on Net-15 or Net-30 payment terms. Your application will be reviewed before approval."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Request Credit" },
        ]}
      />

      <Card className="mb-4 border-slate-200 shadow-card">
        <CardContent className="p-4 sm:p-6">
          <CreditProcessStepper activeStep={activeStep} />
        </CardContent>
      </Card>

      <CreditStatusCard
        status={profile.status}
        approvedLimit={profile.approvedLimit}
        availableCredit={profile.availableCredit}
        creditUsed={profile.creditUsed}
        paymentTerms={profile.paymentTerms}
        className="mb-4"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {view === "submitted" && application ? (
            <CreditApplicationSubmittedView application={application} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="border-slate-200 shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">
                    New Credit Application
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="credit-limit">
                        Requested Credit Limit{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="credit-limit"
                          value={requestedLimit}
                          onChange={(e) => {
                            setRequestedLimit(formatLimitInput(e.target.value));
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              delete next.requestedLimit;
                              return next;
                            });
                          }}
                          placeholder="25,00,000"
                          className={cn(
                            "rounded-xl pl-9",
                            fieldErrors.requestedLimit && "border-red-400",
                          )}
                        />
                      </div>
                      {fieldErrors.requestedLimit ? (
                        <p className="text-xs text-red-600">
                          {fieldErrors.requestedLimit}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Preferred Credit Term{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={creditTerm}
                        onValueChange={(v) =>
                          setCreditTerm(v as CreditTermOption)
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="net_15">Net 15 Days</SelectItem>
                          <SelectItem value="net_30">Net 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label>
                        Expected Monthly Purchase{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={monthlyPurchase}
                        onValueChange={(v) => {
                          setMonthlyPurchase(v as MonthlyPurchaseBand);
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.monthlyPurchase;
                            return next;
                          });
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            "rounded-xl",
                            fieldErrors.monthlyPurchase && "border-red-400",
                          )}
                        >
                          <SelectValue placeholder="Select volume band" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHLY_PURCHASE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldErrors.monthlyPurchase ? (
                        <p className="text-xs text-red-600">
                          {fieldErrors.monthlyPurchase}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="purpose">
                        Purpose <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="purpose"
                        value={purpose}
                        onChange={(e) => {
                          setPurpose(e.target.value);
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.purpose;
                            return next;
                          });
                        }}
                        placeholder="Explain why you require trading credit."
                        className={cn(
                          "min-h-[100px] rounded-xl",
                          fieldErrors.purpose && "border-red-400",
                        )}
                      />
                      {fieldErrors.purpose ? (
                        <p className="text-xs text-red-600">
                          {fieldErrors.purpose}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                {onboardingProvidedCount > 0 ? (
                  <div className="mb-4 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        {onboardingProvidedCount}{" "}
                        {onboardingProvidedCount === 1
                          ? "document"
                          : "documents"}{" "}
                        already on file from onboarding
                      </p>
                      <p className="mt-1 text-xs text-emerald-800/90">
                        Documents submitted during customer onboarding are
                        reused for this credit application. Upload only the
                        remaining items below.
                      </p>
                    </div>
                  </div>
                ) : null}

                {onboardingDocDefs.length > 0 ? (
                  <>
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      Documents on File
                    </h3>
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                      {onboardingDocDefs.map((def) => (
                        <CreditDocumentUploadCard
                          key={def.id}
                          definition={def}
                          upload={documents[def.id]}
                          onUpload={(file) => handleUpload(def.id, file)}
                          onRemove={() => handleRemove(def.id)}
                          onPreview={setPreviewDoc}
                        />
                      ))}
                    </div>
                  </>
                ) : null}

                {remainingDocDefs.length > 0 ? (
                  <>
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      {onboardingProvidedCount > 0
                        ? "Additional Documents Required"
                        : "Required Documents"}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {remainingDocDefs.map((def) => (
                        <CreditDocumentUploadCard
                          key={def.id}
                          definition={def}
                          upload={documents[def.id]}
                          error={fieldErrors[`doc_${def.id}`]}
                          onUpload={(file) => handleUpload(def.id, file)}
                          onRemove={() => handleRemove(def.id)}
                          onPreview={setPreviewDoc}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>

              <Card className="border-slate-200 shadow-card">
                <CardContent className="space-y-4 p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="declaration"
                      checked={declarationAccepted}
                      onCheckedChange={(checked) => {
                        setDeclarationAccepted(checked === true);
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.declaration;
                          return next;
                        });
                      }}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="declaration"
                        className="cursor-pointer text-sm leading-relaxed text-slate-700"
                      >
                        I confirm that all submitted documents are genuine and
                        authorize PetroTrade to verify my business details for
                        credit assessment.{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {fieldErrors.declaration ? (
                        <p className="text-xs text-red-600">
                          {fieldErrors.declaration}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="lg"
                      className="min-w-[220px] rounded-xl bg-brand hover:bg-brand-700"
                      disabled={!canSubmit || submitting}
                      onClick={handleSubmit}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting…
                        </>
                      ) : (
                        "Submit Credit Application"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-xl"
                      onClick={() => router.push(ROUTES.payments)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
          onViewStatus={handleViewStatus}
          onOpenChange={setSuccessOpen}
        />
      ) : null}
    </PageContainer>
  );
}
