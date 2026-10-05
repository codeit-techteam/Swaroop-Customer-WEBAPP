"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
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
import {
  customerKycError,
  fetchCustomerKyc,
  type KycVerification,
  removeCustomerKycDocument,
  uploadCustomerKycDocument,
  verificationAccepted,
  verifyCustomerGst,
} from "@/services/customer-kyc";
import type { GstVerificationResult } from "@/types/onboarding";

const REVERIFY_NOTICE = "Changing this information requires re-verification.";

function toGstResult(verification: KycVerification): GstVerificationResult {
  const d = verification.details;
  return {
    status:
      verification.status === "VERIFYING"
        ? "MANUAL_REVIEW"
        : verification.status,
    message: verification.message,
    companyName: d.legalName ?? null,
    tradeName: d.tradeName ?? null,
    entityStatus: d.gstStatus ?? null,
    registeredOn: d.registrationDate ?? null,
    state: d.state ?? null,
    stateCode: d.stateCode ?? null,
    pan: d.panMasked ?? null,
  };
}

function resultDescription(result: GstVerificationResult): string {
  return [
    result.tradeName ? `Trade name: ${result.tradeName}` : null,
    result.entityStatus ? `Entity status: ${result.entityStatus}` : null,
    result.registeredOn ? `Registered on: ${result.registeredOn}` : null,
    result.state
      ? `State: ${result.state}${result.stateCode ? ` (${result.stateCode})` : ""}`
      : null,
    result.pan ? `PAN: ${result.pan}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

const GSTIN_REGEX =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;

export default function GstVerificationPage() {
  return (
    <RouteGuard stepId="gst-verification">
      <OnboardingLayout
        saveDraftVariant="link"
        helpVariant="button"
        contentClassName="lg:py-6"
      >
        <GstVerificationForm />
      </OnboardingLayout>
    </RouteGuard>
  );
}

function GstVerificationForm() {
  const router = useRouter();
  const gstInfo = useOnboardingStore((s) => s.gstInfo);
  const setGstVerification = useOnboardingStore((s) => s.setGstVerification);
  const setGstCertificate = useOnboardingStore((s) => s.setGstCertificate);
  const saveGstInfo = useOnboardingStore((s) => s.saveGstInfo);

  const [gstin, setGstin] = useState(gstInfo.gstin);
  const [verifying, setVerifying] = useState(false);
  const [gstError, setGstError] = useState<string | null>(null);
  const [certError, setCertError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [kycLocked, setKycLocked] = useState(false);

  // The backend record is shared with the mobile app; reflect what it holds.
  useEffect(() => {
    let active = true;
    fetchCustomerKyc()
      .then((overview) => {
        if (!active) return;
        setKycLocked(overview.locked || overview.kycVerified);
        const saved = overview.organization.gstin;
        const gst = overview.verifications.gst;
        if (saved && gst && verificationAccepted(gst)) {
          setGstin(saved);
          setGstVerification(saved, toGstResult(gst));
        } else if (useOnboardingStore.getState().gstInfo.isVerified) {
          setGstVerification(useOnboardingStore.getState().gstInfo.gstin, null);
        }
        if (overview.verifications.mismatch) {
          setWarning(
            "GST/PAN mismatch: the PAN associated with the GSTIN does not match the entered PAN.",
          );
        }
        const certificate = overview.slots.find(
          (slot) => slot.slot === "gst",
        )?.document;
        setGstCertificate(
          certificate?.r2Confirmed && certificate.status !== "REJECTED"
            ? certificate.fileName
            : null,
          certificate?.r2Confirmed ? certificate.id : null,
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [setGstCertificate, setGstVerification]);

  const isFormatValid = GSTIN_REGEX.test(gstin);
  const verifiedForInput = gstInfo.isVerified && gstInfo.gstin === gstin;
  const inputLocked = kycLocked || verifiedForInput;
  const canContinue =
    verifiedForInput && Boolean(gstInfo.certificateFileName) && !warning;

  async function handleVerify() {
    const normalized = gstin.trim().toUpperCase();
    if (normalized.length !== 15 || !GSTIN_REGEX.test(normalized)) {
      setGstError("Enter a valid 15-character GSTIN");
      return;
    }
    setGstError(null);
    setWarning(null);
    setVerifying(true);
    try {
      const result = await verifyCustomerGst(normalized);
      setGstin(normalized);
      setGstVerification(normalized, toGstResult(result));
      setWarning(result.warning);
      if (result.status === "VERIFIED") toast.success("GSTIN verified");
      else if (result.status === "FAILED") setGstError(result.message);
      else toast.info(result.message);
    } catch (error) {
      setGstError(customerKycError(error, "GST verification failed."));
    } finally {
      setVerifying(false);
    }
  }

  function handleContinue() {
    if (!verifiedForInput) {
      setGstError("Please verify your GSTIN");
      return;
    }
    if (warning) {
      setGstError(warning);
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
    <div className="mx-auto max-w-5xl">
      <StepHeader
        title="GST & Tax Verification"
        description="Verify your business's legal identity to unlock trading credit limits."
        className="mb-5 sm:mb-6"
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_250px]">
        <div className="space-y-4">
          <SectionCard className="p-4 sm:p-5">
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
                  disabled={inputLocked || verifying}
                  className={cn(
                    "pr-10 font-mono uppercase",
                    verifiedForInput && "border-emerald-300",
                  )}
                  aria-invalid={Boolean(gstError)}
                  aria-describedby={gstError ? "gstin-error" : undefined}
                />
                {verifiedForInput && isFormatValid ? (
                  <CheckCircle2
                    className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <Button
                type="button"
                onClick={() => void handleVerify()}
                disabled={verifying || inputLocked || gstin.length !== 15}
                className={cn(
                  "h-10 sm:px-6",
                  verifiedForInput &&
                    gstInfo.verification?.status === "VERIFIED"
                    ? "bg-emerald-600 hover:bg-emerald-600 disabled:opacity-100"
                    : gstInfo.verification?.status === "FAILED" &&
                        gstInfo.gstin === gstin &&
                        !verifying
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-slate-900 hover:bg-slate-800",
                )}
              >
                {verifying
                  ? "Verifying…"
                  : verifiedForInput
                    ? gstInfo.verification?.status === "VERIFIED"
                      ? "✓ Verified"
                      : "In review"
                    : gstInfo.verification?.status === "FAILED" &&
                        gstInfo.gstin === gstin
                      ? "✕ Failed"
                      : "Verify"}
              </Button>
            </div>
            {inputLocked ? (
              <p className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-500">
                <span>{REVERIFY_NOTICE}</span>
                {!kycLocked ? (
                  <button
                    type="button"
                    className="font-semibold text-slate-900 hover:underline"
                    onClick={() => {
                      setGstVerification(gstin, null);
                      setWarning(null);
                    }}
                  >
                    Change
                  </button>
                ) : null}
              </p>
            ) : null}
            {warning ? (
              <p className="mt-2 text-xs text-amber-700" role="alert">
                {warning}
              </p>
            ) : null}
            {gstError ? (
              <p
                id="gstin-error"
                className="mt-2 text-xs text-red-600"
                role="alert"
              >
                {gstError}
              </p>
            ) : null}

            {verifiedForInput && gstInfo.verification ? (
              <div className="mt-4">
                {gstInfo.verification.status === "VERIFIED" ? (
                  <SuccessCard
                    title={
                      gstInfo.verification.companyName
                        ? `Valid GSTIN — ${gstInfo.verification.companyName}`
                        : "Valid GSTIN"
                    }
                    description={resultDescription(gstInfo.verification)}
                  />
                ) : (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    {gstInfo.verification.message}
                  </p>
                )}
              </div>
            ) : null}
          </SectionCard>

          <SectionCard
            title="GST Registration Certificate"
            className="p-4 sm:p-5"
          >
            <UploadCard
              accept={{
                "application/pdf": [".pdf"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              maxSizeMb={10}
              fileName={gstInfo.certificateFileName}
              uploadFile={async (file, onProgress) => {
                const stored = await uploadCustomerKycDocument("gst", file, {
                  onProgress,
                });
                setGstCertificate(stored.fileName, stored.id);
              }}
              uploadErrorMessage={(error) =>
                customerKycError(error, "Could not upload the certificate.")
              }
              onUpload={() => setCertError(null)}
              onRemove={() => {
                const documentId = gstInfo.certificateDocumentId;
                if (kycLocked) return;
                setGstCertificate(null);
                if (documentId) {
                  void removeCustomerKycDocument(documentId).catch((error) =>
                    toast.error(
                      customerKycError(error, "Could not remove the file."),
                    ),
                  );
                }
              }}
              dropLabel="Click to upload or drag & drop"
              helperText="PDF, JPG, or PNG (Max 10MB)"
              compact
            />
            {certError ? (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {certError}
              </p>
            ) : null}
          </SectionCard>
        </div>

        <aside className="space-y-3">
          <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4 text-white shadow-md">
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

      <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
