"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  OnboardingLayout,
  RouteGuard,
  StepHeader,
  SectionCard,
  UploadCard,
  SuccessCard,
  InfoCard,
  BackButton,
  SaveDraftButton,
  ContinueButton,
} from "@/components/onboarding";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ONBOARDING_ROUTES } from "@/constants/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { cn } from "@/lib/utils";

const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

export default function GstVerificationPage() {
  return (
    <RouteGuard stepId="gst-verification">
      <OnboardingLayout saveDraftVariant="link" helpVariant="button">
        <GstVerificationForm />
      </OnboardingLayout>
    </RouteGuard>
  );
}

function GstVerificationForm() {
  const router = useRouter();
  const gstInfo = useOnboardingStore((s) => s.gstInfo);
  const verifyGST = useOnboardingStore((s) => s.verifyGST);
  const setGstCertificate = useOnboardingStore((s) => s.setGstCertificate);
  const saveGstInfo = useOnboardingStore((s) => s.saveGstInfo);

  const [gstin, setGstin] = useState(gstInfo.gstin);
  const [verifying, setVerifying] = useState(false);
  const [gstError, setGstError] = useState<string | null>(null);
  const [certError, setCertError] = useState<string | null>(null);

  const isFormatValid = GSTIN_REGEX.test(gstin);
  const canContinue =
    gstInfo.isVerified && Boolean(gstInfo.certificateFileName);

  function handleVerify() {
    const normalized = gstin.trim().toUpperCase();
    if (normalized.length !== 15 || !GSTIN_REGEX.test(normalized)) {
      setGstError("Enter a valid 15-character GSTIN");
      return;
    }
    setGstError(null);
    setVerifying(true);
    window.setTimeout(() => {
      verifyGST(normalized);
      setGstin(normalized);
      setVerifying(false);
      toast.success("GSTIN verified successfully");
    }, 600);
  }

  function handleContinue() {
    if (!gstInfo.isVerified) {
      setGstError("Please verify your GSTIN");
      return;
    }
    if (!gstInfo.certificateFileName) {
      setCertError("Upload GST registration certificate");
      return;
    }
    setCertError(null);
    saveGstInfo({});
    router.push(ONBOARDING_ROUTES.businessAddress);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <StepHeader
        title="GST & Tax Verification"
        description="Verify your business's legal identity to unlock trading credit limits."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <SectionCard>
            <Label htmlFor="gstin" className="mb-2 block">
              GST Identification Number (GSTIN)
            </Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Input
                  id="gstin"
                  value={gstin}
                  onChange={(e) => {
                    setGstin(e.target.value.toUpperCase());
                    setGstError(null);
                  }}
                  placeholder="27AAAAA0000A1Z5"
                  maxLength={15}
                  className={cn(
                    "pr-10 font-mono uppercase",
                    gstInfo.isVerified && isFormatValid && "border-emerald-300",
                  )}
                  aria-invalid={Boolean(gstError)}
                  aria-describedby={gstError ? "gstin-error" : undefined}
                />
                {isFormatValid ? (
                  <CheckCircle2
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <Button
                type="button"
                onClick={handleVerify}
                disabled={verifying || gstin.length !== 15}
                className="h-10 bg-slate-900 hover:bg-slate-800 sm:px-6"
              >
                {verifying ? "Verifying…" : "Verify"}
              </Button>
            </div>
            {gstError ? (
              <p
                id="gstin-error"
                className="mt-2 text-xs text-red-600"
                role="alert"
              >
                {gstError}
              </p>
            ) : null}

            {gstInfo.isVerified && gstInfo.verification ? (
              <div className="mt-4 space-y-3">
                <SuccessCard
                  title={`Valid GSTIN — ${gstInfo.verification.companyName}`}
                  description={`Entity status: ${gstInfo.verification.entityStatus} | Registered on: ${gstInfo.verification.registeredOn}`}
                />
                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      PAN Card (Extracted)
                    </p>
                    <p className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                      {gstInfo.verification.pan}
                    </p>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                    Linked to GSTIN
                  </p>
                </div>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="GST Registration Certificate">
            <UploadCard
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              maxSizeMb={5}
              fileName={gstInfo.certificateFileName}
              onUpload={(name) => {
                setGstCertificate(name);
                setCertError(null);
              }}
              onRemove={() => setGstCertificate(null)}
              dropLabel="Click to upload or drag & drop"
              helperText="PDF, JPG, or PNG (Max 5MB)"
            />
            {certError ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {certError}
              </p>
            ) : null}
          </SectionCard>
        </div>

        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-xl bg-slate-900 p-5 text-white shadow-md">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <ShieldCheck
                className="mb-3 h-6 w-6 text-sky-300"
                aria-hidden="true"
              />
              <h3 className="text-base font-semibold">
                Industrial Reliability
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Your data is secured using enterprise-grade encryption and
                institutional protocols.
              </p>
            </div>
          </div>

          <InfoCard title="Why verify GST?" className="bg-sky-50">
            <ul className="mt-2 space-y-1.5 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                Immediate access to bulk trading rates
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                Tax compliance for industrial invoices
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                Automatic credit score calculation
              </li>
            </ul>
          </InfoCard>
        </aside>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <BackButton href={ONBOARDING_ROUTES.companyInformation} />
        <div className="flex items-center justify-end gap-3">
          <SaveDraftButton variant="outline" />
          <ContinueButton
            label="Continue"
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
