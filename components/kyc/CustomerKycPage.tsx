"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  FileText,
  Loader2,
  MessageSquareWarning,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import {
  CUSTOMER_KYC_MIME_TYPES,
  GSTIN_PATTERN,
  PAN_PATTERN,
  customerKycError,
  fetchCustomerKyc,
  getCustomerKycDocumentUrl,
  kycNeedsAction,
  normalizeIdentifier,
  removeCustomerKycDocument,
  submitCustomerKyc,
  uploadCustomerKycDocument,
  verificationAccepted,
  verifyCustomerGst,
  verifyCustomerPan,
  type CustomerKycOverview,
  type CustomerKycSlot,
  type CustomerKycSlotCode,
  type KycChecklistItem,
  type KycVerification,
  type KycVerifyResult,
} from "@/services/customer-kyc";

const ACCEPT = Object.entries(CUSTOMER_KYC_MIME_TYPES)
  .flatMap(([mime, exts]) => [mime, ...exts])
  .join(",");

const IDENTITY_SECTION_ID = "kyc-identity";

function formatDateTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(value: string | null): string | null {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function scrollToIdentity() {
  document
    .getElementById(IDENTITY_SECTION_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StatusBanner({ overview }: { overview: CustomerKycOverview }) {
  if (overview.kycVerified) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4" /> KYC verified
          </p>
          <p className="mt-1 text-sm">
            Your business is verified. You have full access to PetroTrade.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href={ROUTES.home}>Go to Home</Link>
        </Button>
      </div>
    );
  }
  if (kycNeedsAction(overview.status)) {
    const changes = overview.status === "CHANGES_REQUESTED";
    const reason = changes
      ? overview.changeRequest?.reason
      : overview.rejectedReason;
    const at = changes
      ? overview.changeRequest?.requestedAt
      : overview.reviewedAt;
    return (
      <div
        role="alert"
        className={cn(
          "rounded-xl border p-4",
          changes
            ? "border-amber-300 bg-amber-50 text-amber-900"
            : "border-red-200 bg-red-50 text-red-900",
        )}
      >
        <p className="flex items-center gap-2 font-semibold">
          {changes ? (
            <MessageSquareWarning className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {changes ? "Changes requested" : "KYC needs correction"}
        </p>
        {reason ? (
          <p className="mt-2 whitespace-pre-line text-sm">
            <span className="font-medium">Reason: </span>
            {reason}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs opacity-80">
            {formatDateTime(at) ? `Reviewed ${formatDateTime(at)}. ` : ""}
            Fix the highlighted items below, then resubmit.
          </p>
          <Button size="sm" onClick={scrollToIdentity}>
            <RotateCcw /> Update &amp; Resubmit
          </Button>
        </div>
      </div>
    );
  }
  if (overview.status === "SUBMITTED") {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900">
        <p className="flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 shrink-0" /> Your KYC is under review
        </p>
        <p className="mt-1 text-sm">
          Submitted {formatDateTime(overview.submittedAt) ?? "recently"}. The
          PetroTrade compliance team is reviewing your details. We&apos;ll
          notify you once the review is complete.
        </p>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      Verify your PAN and GSTIN, upload your business documents, then submit
      them for review.
    </div>
  );
}

const CHECKLIST_ICON: Record<
  KycChecklistItem["state"],
  { icon: typeof Circle; className: string }
> = {
  done: { icon: CheckCircle2, className: "text-emerald-600" },
  pending: { icon: Clock, className: "text-sky-600" },
  attention: { icon: AlertTriangle, className: "text-amber-600" },
  todo: { icon: Circle, className: "text-slate-300" },
};

function ProgressChecklist({ items }: { items: KycChecklistItem[] }) {
  const done = items.filter((item) => item.state === "done").length;
  return (
    <section
      aria-label="KYC progress"
      className="rounded-xl border bg-white p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">KYC progress</h2>
        <span className="text-xs text-slate-500">
          {done} of {items.length} complete
        </span>
      </div>
      <Progress
        value={items.length ? (done / items.length) * 100 : 0}
        className="mt-3 h-1.5"
      />
      <ol className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const { icon: Icon, className } = CHECKLIST_ICON[item.state];
          return (
            <li key={item.key} className="flex items-start gap-2">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", className)} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const VERIFICATION_BADGE: Record<
  KycVerification["status"],
  { label: string; className: string }
> = {
  VERIFIED: { label: "Verified", className: "bg-emerald-50 text-emerald-700" },
  MANUAL_REVIEW: {
    label: "Manual review",
    className: "bg-sky-50 text-sky-700",
  },
  VERIFYING: { label: "Verifying", className: "bg-sky-50 text-sky-700" },
  FAILED: { label: "Not verified", className: "bg-red-50 text-red-700" },
};

type IdentityCardProps = {
  kind: "PAN" | "GST";
  value: string;
  savedValue: string | null;
  verification: KycVerification | null;
  lastAttempt: { value: string; result: KycVerifyResult } | null;
  locked: boolean;
  verifying: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onVerify: () => void;
};

function verificationFacts(
  kind: "PAN" | "GST",
  verification: KycVerification,
): Array<[string, string]> {
  const d = verification.details;
  const facts: Array<[string, string | null | undefined]> =
    kind === "PAN"
      ? [
          ["Name on PAN", d.nameOnPan],
          ["Category", d.panCategory],
          ["Status", d.panStatus],
        ]
      : [
          ["Legal name", d.legalName],
          ["Trade name", d.tradeName],
          ["GST status", d.gstStatus],
          ["Registered", d.registrationDate],
          ["Address", d.address],
        ];
  return facts.filter((fact): fact is [string, string] => Boolean(fact[1]));
}

function IdentityCard({
  kind,
  value,
  savedValue,
  verification,
  lastAttempt,
  locked,
  verifying,
  disabled,
  onChange,
  onVerify,
}: IdentityCardProps) {
  const label = kind === "PAN" ? "PAN" : "GSTIN";
  const pattern = kind === "PAN" ? PAN_PATTERN : GSTIN_PATTERN;
  const maxLength = kind === "PAN" ? 10 : 15;
  const shown =
    lastAttempt && lastAttempt.value === value
      ? lastAttempt.result
      : !value || value === savedValue
        ? verification
        : null;
  const warning =
    lastAttempt && lastAttempt.value === value
      ? lastAttempt.result.warning
      : null;
  const formatError =
    value && !pattern.test(value)
      ? kind === "PAN"
        ? "Enter a valid 10-character PAN, for example ABCDE1234F"
        : "Enter a valid 15-character GSTIN"
      : null;
  const accepted = verificationAccepted(shown) && value === savedValue;
  const canVerify =
    !locked && !disabled && !verifying && Boolean(value) && !formatError;
  const badge = shown ? VERIFICATION_BADGE[shown.status] : null;
  const facts = shown ? verificationFacts(kind, shown) : [];
  const inputId = `kyc-${kind.toLowerCase()}`;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4",
        shown?.status === "FAILED" && "border-red-200",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={inputId} className="font-medium text-slate-900">
          {label}
        </Label>
        <span className="text-xs text-slate-500">Required</span>
        {badge ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              badge.className,
            )}
          >
            {badge.label}
          </span>
        ) : value && !accepted ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            Not verified yet
          </span>
        ) : null}
      </div>

      {locked ? (
        <p className="mt-2 font-mono text-sm text-slate-800">
          {shown?.identifierMasked ?? "—"}
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            id={inputId}
            value={value}
            maxLength={maxLength}
            autoComplete="off"
            spellCheck={false}
            placeholder={kind === "PAN" ? "ABCDE1234F" : "27ABCDE1234F1Z5"}
            disabled={disabled || verifying}
            aria-invalid={Boolean(formatError)}
            onChange={(event) =>
              onChange(normalizeIdentifier(event.target.value))
            }
            className="font-mono uppercase"
          />
          <Button
            type="button"
            variant={accepted ? "outline" : "default"}
            disabled={!canVerify || (accepted && shown?.status === "VERIFIED")}
            onClick={onVerify}
            className="shrink-0"
          >
            {verifying ? (
              <>
                <Loader2 className="animate-spin" /> Verifying {label}…
              </>
            ) : shown?.status === "VERIFIED" && accepted ? (
              <>
                <CheckCircle2 /> Verified
              </>
            ) : shown && value === savedValue ? (
              `Verify ${label} again`
            ) : (
              `Verify ${label}`
            )}
          </Button>
        </div>
      )}

      {!locked && formatError ? (
        <p className="mt-1.5 text-xs text-destructive">{formatError}</p>
      ) : null}
      {shown && shown.status !== "VERIFIED" ? (
        <p
          className={cn(
            "mt-2 text-xs",
            shown.status === "FAILED" ? "text-red-700" : "text-sky-800",
          )}
        >
          {!value || value !== savedValue ? `${shown.identifierMasked}: ` : ""}
          {shown.message}
        </p>
      ) : null}
      {warning ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {warning}
        </p>
      ) : null}
      {facts.length ? (
        <dl className="mt-3 grid gap-x-4 gap-y-1.5 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2">
          {facts.map(([term, detail]) => (
            <div key={term} className="min-w-0">
              <dt className="text-slate-500">{term}</dt>
              <dd className="truncate font-medium text-slate-800">{detail}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function documentBadge(slot: CustomerKycSlot) {
  const doc = slot.document;
  if (!doc) {
    return slot.required
      ? { label: "Upload required", className: "bg-amber-50 text-amber-800" }
      : null;
  }
  switch (doc.status) {
    case "VERIFIED":
      return {
        label: "Verified",
        className: "bg-emerald-50 text-emerald-700",
      };
    case "REJECTED":
      return { label: "Rejected", className: "bg-red-50 text-red-700" };
    default:
      return {
        label: "Verification pending",
        className: "bg-sky-50 text-sky-700",
      };
  }
}

type SlotCardProps = {
  slot: CustomerKycSlot;
  locked: boolean;
  progress: number | undefined;
  busy: boolean;
  onPick: (file: File) => void;
  onCancel: () => void;
  onView: () => void;
  onRemove: () => void;
};

function SlotCard({
  slot,
  locked,
  progress,
  busy,
  onPick,
  onCancel,
  onView,
  onRemove,
}: SlotCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const doc = slot.document;
  const rejected = doc?.status === "REJECTED";
  const writable = !locked || rejected;
  const uploading = progress !== undefined;
  const highlighted = slot.changeRequested || rejected;
  const badge = documentBadge(slot);
  const size = doc ? formatBytes(doc.fileSizeBytes) : null;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4",
        highlighted && "border-amber-300 ring-2 ring-amber-200",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <FileText className="h-5 w-5 text-slate-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{slot.name}</p>
            {slot.required ? (
              <span className="text-xs text-slate-500">Required</span>
            ) : (
              <span className="text-xs text-slate-400">Optional</span>
            )}
            {badge ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
            ) : null}
            {slot.changeRequested && !rejected ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                Change requested
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">{slot.description}</p>

          {doc ? (
            <p className="mt-2 truncate text-sm text-slate-700">
              {doc.fileName}
              {size ? <span className="text-slate-400"> · {size}</span> : null}
            </p>
          ) : null}
          {rejected && doc?.rejectionReason ? (
            <p className="mt-1 text-xs text-red-700">
              Reason: {doc.rejectionReason}
            </p>
          ) : null}

          {uploading ? (
            <div className="mt-3 flex items-center gap-3">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="w-10 text-right text-xs text-slate-500">
                {progress}%
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {writable ? (
                <Button
                  type="button"
                  size="sm"
                  variant={doc && !rejected ? "outline" : "default"}
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload />
                  {rejected ? "Upload new file" : doc ? "Replace" : "Upload"}
                </Button>
              ) : null}
              {doc?.r2Confirmed ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onView}
                >
                  <Eye /> View
                </Button>
              ) : null}
              {doc && !locked ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={onRemove}
                >
                  <Trash2 /> Remove
                </Button>
              ) : null}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onPick(file);
            }}
          />
        </div>
      </div>
    </div>
  );
}

type IdentityKind = "PAN" | "GST";
type Attempt = { value: string; result: KycVerifyResult };

export function CustomerKycPage() {
  const [overview, setOverview] = useState<CustomerKycOverview | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [attempts, setAttempts] = useState<
    Partial<Record<IdentityKind, Attempt>>
  >({});
  const [verifying, setVerifying] = useState<IdentityKind | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const controllers = useRef(new Map<string, AbortController>());

  const apply = useCallback((next: CustomerKycOverview) => {
    setOverview(next);
    setBusinessName(
      next.organization.legalName ?? next.organization.name ?? "",
    );
    setPan(next.organization.pan ?? "");
    setGstin(next.organization.gstin ?? "");
  }, []);

  const reload = useCallback(async () => {
    const next = await fetchCustomerKyc();
    setOverview(next);
    return next;
  }, []);

  const load = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    return fetchCustomerKyc()
      .then(apply)
      .catch((error) =>
        setLoadError(customerKycError(error, "Could not load your KYC")),
      )
      .finally(() => setLoading(false));
  }, [apply]);

  useEffect(() => {
    void load();
    const pending = controllers.current;
    return () => pending.forEach((controller) => controller.abort());
  }, [load]);

  // Pick up admin decisions made while the page was open in another tab.
  useEffect(() => {
    const onFocus = () => {
      if (!verifying && !submitting) void reload().catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reload, verifying, submitting]);

  const verify = async (kind: IdentityKind) => {
    const value = kind === "PAN" ? pan : gstin;
    setVerifying(kind);
    try {
      const result =
        kind === "PAN"
          ? await verifyCustomerPan(value)
          : await verifyCustomerGst(value);
      setAttempts((prev) => ({ ...prev, [kind]: { value, result } }));
      const next = await reload();
      if (
        kind === "GST" &&
        result.status === "VERIFIED" &&
        result.details.legalName &&
        !next.organization.legalName
      ) {
        setBusinessName(result.details.legalName);
      }
      const label = kind === "PAN" ? "PAN" : "GSTIN";
      if (result.status === "VERIFIED") toast.success(`${label} verified`);
      else if (result.status === "MANUAL_REVIEW") toast.info(result.message);
      else toast.error(result.message);
    } catch (error) {
      toast.error(
        customerKycError(
          error,
          "Verification service is unavailable. Please try again shortly.",
        ),
      );
    } finally {
      setVerifying(null);
    }
  };

  const upload = async (slot: CustomerKycSlotCode, file: File) => {
    const controller = new AbortController();
    controllers.current.set(slot, controller);
    setProgress((prev) => ({ ...prev, [slot]: 0 }));
    try {
      await uploadCustomerKycDocument(slot, file, {
        signal: controller.signal,
        onProgress: (percent) =>
          setProgress((prev) => ({ ...prev, [slot]: percent })),
      });
      await reload();
      toast.success(`${file.name} uploaded`);
    } catch (error) {
      if (!controller.signal.aborted) {
        toast.error(
          customerKycError(error, "Upload failed. Please try again."),
        );
      }
    } finally {
      controllers.current.delete(slot);
      setProgress((prev) => {
        const next = { ...prev };
        delete next[slot];
        return next;
      });
    }
  };

  const view = async (documentId: string) => {
    try {
      const url = await getCustomerKycDocumentUrl(documentId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(customerKycError(error, "Could not open the document"));
    }
  };

  const remove = async (documentId: string) => {
    try {
      await removeCustomerKycDocument(documentId);
      await reload();
    } catch (error) {
      toast.error(customerKycError(error, "Could not remove the document"));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !overview) {
    return (
      <PageContainer className="max-w-3xl">
        <div className="rounded-xl border border-dashed p-6 text-sm text-slate-600">
          {loadError ?? "Could not load your KYC."}{" "}
          <button
            type="button"
            className="font-medium text-primary underline"
            onClick={() => void load()}
          >
            Retry
          </button>
        </div>
      </PageContainer>
    );
  }

  const locked = overview.locked || overview.kycVerified;
  const uploading = Object.keys(progress).length > 0;
  const busy = submitting || verifying !== null;
  const unverifiedEdits = [
    pan && pan !== (overview.organization.pan ?? "") ? "PAN" : null,
    gstin && gstin !== (overview.organization.gstin ?? "") ? "GSTIN" : null,
  ].filter((item): item is string => Boolean(item));
  const gstLegalName =
    overview.verifications.gst?.status === "VERIFIED"
      ? overview.verifications.gst.details.legalName
      : null;

  const submit = async () => {
    if (unverifiedEdits.length) {
      toast.error(
        `Verify the ${unverifiedEdits.join(" and ")} you entered before submitting.`,
      );
      scrollToIdentity();
      return;
    }
    if (overview.missingRequired.length) {
      toast.error(`Still required: ${overview.missingRequired.join(", ")}`);
      return;
    }
    setSubmitting(true);
    try {
      apply(await submitCustomerKyc({ businessName }));
      setAttempts({});
      toast.success(
        "KYC submitted. We'll notify you once the review is complete.",
      );
    } catch (error) {
      toast.error(customerKycError(error, "Could not submit your KYC"));
      await reload().catch(() => undefined);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Business KYC"
        description="Your details are verified securely by PetroTrade and reviewed by our compliance team."
        breadcrumbs={[
          { label: "Profile", href: ROUTES.profile },
          { label: "Business KYC" },
        ]}
      />

      <StatusBanner overview={overview} />

      {overview.checklist.length ? (
        <ProgressChecklist items={overview.checklist} />
      ) : null}

      <section id={IDENTITY_SECTION_ID} className="scroll-mt-24 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            PAN &amp; GST verification
          </h2>
          <p className="text-xs text-slate-500">
            {locked
              ? "Locked while your KYC is under review or verified."
              : "The PAN must match the one in your GSTIN. Only verified details are saved."}
          </p>
        </div>
        <div className="grid gap-3">
          <IdentityCard
            kind="PAN"
            value={pan}
            savedValue={overview.organization.pan}
            verification={overview.verifications.pan}
            lastAttempt={attempts.PAN ?? null}
            locked={locked}
            verifying={verifying === "PAN"}
            disabled={busy && verifying !== "PAN"}
            onChange={setPan}
            onVerify={() => void verify("PAN")}
          />
          <IdentityCard
            kind="GST"
            value={gstin}
            savedValue={overview.organization.gstin}
            verification={overview.verifications.gst}
            lastAttempt={attempts.GST ?? null}
            locked={locked}
            verifying={verifying === "GST"}
            disabled={busy && verifying !== "GST"}
            onChange={setGstin}
            onVerify={() => void verify("GST")}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Documents</h2>
        <div className="grid gap-3">
          {overview.slots.map((slot) => (
            <SlotCard
              key={slot.slot}
              slot={slot}
              locked={locked}
              progress={progress[slot.slot]}
              busy={submitting || progress[slot.slot] !== undefined}
              onPick={(file) => void upload(slot.slot, file)}
              onCancel={() => controllers.current.get(slot.slot)?.abort()}
              onView={() => slot.document && void view(slot.document.id)}
              onRemove={() => slot.document && void remove(slot.document.id)}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500">
          PDF, JPG, PNG or WEBP up to 10 MB. Files are stored privately.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Business details
          </h2>
          <p className="text-xs text-slate-500">
            {locked
              ? "Locked while your KYC is under review or verified."
              : "Saved when you submit. Should match your GST registration."}
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="kyc-business-name">Business name</Label>
          <Input
            id="kyc-business-name"
            value={businessName}
            maxLength={200}
            disabled={locked || busy}
            onChange={(event) => setBusinessName(event.target.value)}
          />
          {gstLegalName && !locked && gstLegalName !== businessName ? (
            <p className="text-xs text-slate-500">
              Legal name as per GST: {gstLegalName}.{" "}
              <button
                type="button"
                className="font-medium text-primary underline"
                onClick={() => setBusinessName(gstLegalName)}
              >
                Use this
              </button>
            </p>
          ) : null}
        </div>
      </section>

      {!locked ? (
        <div className="flex flex-col items-end gap-2">
          {overview.missingRequired.length ? (
            <p className="text-right text-xs text-amber-700">
              Still required: {overview.missingRequired.join(", ")}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={
              busy ||
              uploading ||
              !overview.canSubmit ||
              unverifiedEdits.length > 0
            }
            onClick={() => void submit()}
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" /> Submitting KYC…
              </>
            ) : kycNeedsAction(overview.status) ? (
              "Resubmit for review"
            ) : (
              "Submit for review"
            )}
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}
