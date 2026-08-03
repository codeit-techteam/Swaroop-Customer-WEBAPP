"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, IndianRupee, Shield } from "lucide-react";
import { toast } from "sonner";
import { ONBOARDING_ROUTES } from "@/constants/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  OnboardingLayout,
  RouteGuard,
  StepHeader,
  UploadCard,
  InfoCard,
  SectionCard,
  BackButton,
  SaveDraftLink,
  ContinueButton,
} from "@/components/onboarding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CreditDocuments } from "@/types/onboarding";

export default function CreditEligibilityPage() {
  return (
    <RouteGuard stepId="credit-eligibility">
      <OnboardingLayout saveDraftVariant="link" helpVariant="button">
        <CreditEligibilityForm />
      </OnboardingLayout>
    </RouteGuard>
  );
}

function CreditEligibilityForm() {
  const router = useRouter();
  const creditDocuments = useOnboardingStore((s) => s.creditDocuments);
  const creditLimitStored = useOnboardingStore((s) => s.creditLimit);
  const setCreditDocument = useOnboardingStore((s) => s.setCreditDocument);
  const saveCredit = useOnboardingStore((s) => s.saveCredit);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const [creditLimit, setCreditLimit] = useState(creditLimitStored);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreditDocuments | "creditLimit", string>>
  >({});

  const canContinue =
    Boolean(creditDocuments.auditedFinancials) &&
    Boolean(creditDocuments.bankStatements) &&
    Boolean(creditDocuments.itr);

  function handleContinue() {
    const nextErrors: typeof errors = {};
    if (!creditDocuments.auditedFinancials) {
      nextErrors.auditedFinancials = "Audited financials are required";
    }
    if (!creditDocuments.bankStatements) {
      nextErrors.bankStatements = "Bank statements are required";
    }
    if (!creditDocuments.itr) {
      nextErrors.itr = "ITR documents are required";
    }
    if (creditLimit && !/^\d+(\.\d{1,2})?$/.test(creditLimit)) {
      nextErrors.creditLimit = "Enter a valid amount";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete required document uploads");
      return;
    }

    saveCredit(creditDocuments, creditLimit);
    completeOnboarding();
    router.push(ONBOARDING_ROUTES.completion);
  }

  function uploadDoc(key: keyof CreditDocuments, fileName: string) {
    setCreditDocument(key, {
      fileName,
      uploadedAt: new Date().toISOString(),
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <div className="mx-auto max-w-6xl">
      <StepHeader
        stepLabel="Step 05 · Financial Assessment"
        title="Credit Eligibility Assessment"
        description="Upload financial records so PetroTrade Credit Partners can underwrite your trading credit line."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <InfoCard
            variant="security"
            icon={Shield}
            title="ISO 27001 Certified Data Security"
          >
            All documents are encrypted end-to-end and accessible only to
            authorized underwriting partners.
          </InfoCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <SectionCard className="relative">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Audited Financials
                    </h3>
                    <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                      Required
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Consolidated statements for the last 3 fiscal years (PDF
                    format only).
                  </p>
                </div>
              </div>
              <UploadCard
                accept={{ "application/pdf": [".pdf"] }}
                maxSizeMb={25}
                fileName={creditDocuments.auditedFinancials?.fileName ?? null}
                onUpload={(name) => uploadDoc("auditedFinancials", name)}
                onRemove={() => setCreditDocument("auditedFinancials", null)}
                dropLabel="Upload PDF"
                compact
              />
              {errors.auditedFinancials ? (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {errors.auditedFinancials}
                </p>
              ) : null}
            </SectionCard>

            <SectionCard>
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Bank Statements
                    </h3>
                    <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                      Required
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Past 6 months statement for primary operating account.
                  </p>
                </div>
              </div>
              <UploadCard
                accept={{
                  "application/pdf": [".pdf"],
                  "application/vnd.ms-excel": [".xls"],
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    [".xlsx"],
                }}
                maxSizeMb={25}
                fileName={creditDocuments.bankStatements?.fileName ?? null}
                onUpload={(name) => uploadDoc("bankStatements", name)}
                onRemove={() => setCreditDocument("bankStatements", null)}
                dropLabel="Upload PDF/XLS"
                compact
              />
              {errors.bankStatements ? (
                <p className="mt-2 text-xs text-red-600" role="alert">
                  {errors.bankStatements}
                </p>
              ) : null}
            </SectionCard>
          </div>

          <SectionCard>
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FileText className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Income Tax Returns (ITR)
                  </h3>
                  <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                    Required
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Acknowledgement and full return forms for the most recent
                  assessment year.
                </p>
              </div>
            </div>
            <UploadCard
              accept={{
                "application/pdf": [".pdf"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
              }}
              maxSizeMb={25}
              fileName={creditDocuments.itr?.fileName ?? null}
              onUpload={(name) => uploadDoc("itr", name)}
              onRemove={() => setCreditDocument("itr", null)}
              dropLabel="Upload ITR Files"
              compact
            />
            {errors.itr ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {errors.itr}
              </p>
            ) : null}
          </SectionCard>

          <SectionCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <IndianRupee className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                Requested Credit Limit
              </h3>
            </div>
            <Label htmlFor="credit-limit">
              Target Facility Amount (Optional)
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                ₹
              </span>
              <Input
                id="credit-limit"
                value={creditLimit}
                onChange={(e) => {
                  setCreditLimit(e.target.value.replace(/[^\d.]/g, ""));
                  setErrors((prev) => ({ ...prev, creditLimit: undefined }));
                }}
                placeholder="Enter amount in Indian Rupees"
                className="pl-7"
                inputMode="decimal"
                aria-describedby="credit-limit-note"
              />
            </div>
            {errors.creditLimit ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {errors.creditLimit}
              </p>
            ) : null}
            <p
              id="credit-limit-note"
              className="mt-2 text-xs italic text-slate-500"
            >
              Final credit limits are subject to underwriting by PetroTrade
              Credit Partners.
            </p>
          </SectionCard>
        </div>

        <aside className="space-y-4">
          <div
            className="h-36 overflow-hidden rounded-xl bg-slate-300"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)",
            }}
            role="img"
            aria-label="Petrochemical facility"
          />

          <div className="rounded-xl bg-slate-900 p-5 text-white shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-sky-300" aria-hidden="true" />
              <h3 className="font-semibold">PetroTrade Credit</h3>
            </div>
            <p className="text-sm text-slate-300">
              Collateral-free credit lines up to{" "}
              <span className="font-semibold text-white">₹50Cr</span>.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                "Interest-free period up to 45 days",
                "No hidden processing fees",
                "Real-time settlement with suppliers",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  <span className="text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              className="mt-5 w-full bg-sky-600 hover:bg-sky-500"
              onClick={() => toast.info("Partner details coming soon")}
            >
              Learn More About Partners
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Upload Guidelines
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-600">
              <li>Ensure documents are legible and not password protected.</li>
              <li>Upload all pages including schedules.</li>
              <li>Max file size: 25MB.</li>
            </ol>
          </div>
        </aside>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href={ONBOARDING_ROUTES.shippingAddress} />
        <div className="flex items-center justify-end gap-4">
          <SaveDraftLink />
          <ContinueButton
            label="Continue to Review"
            type="button"
            showArrow
            disabled={!canContinue}
            onClick={handleContinue}
          />
        </div>
      </div>
    </div>
  );
}
