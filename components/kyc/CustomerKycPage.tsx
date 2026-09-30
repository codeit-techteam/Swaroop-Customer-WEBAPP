"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  MessageSquareWarning,
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
  removeCustomerKycDocument,
  submitCustomerKyc,
  uploadCustomerKycDocument,
  type CustomerKycOverview,
  type CustomerKycSlot,
  type CustomerKycSlotCode,
} from "@/services/customer-kyc";

const ACCEPT = Object.entries(CUSTOMER_KYC_MIME_TYPES)
  .flatMap(([mime, exts]) => [mime, ...exts])
  .join(",");

type BusinessDetails = { businessName: string; gstin: string; pan: string };

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

function detailsFrom(overview: CustomerKycOverview): BusinessDetails {
  return {
    businessName:
      overview.organization.legalName ?? overview.organization.name ?? "",
    gstin: overview.organization.gstin ?? "",
    pan: overview.organization.pan ?? "",
  };
}

function StatusBanner({ overview }: { overview: CustomerKycOverview }) {
  if (overview.changeRequest) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
      >
        <p className="flex items-center gap-2 font-semibold">
          <MessageSquareWarning className="h-4 w-4" />
          PetroTrade requested changes to your KYC
        </p>
        <p className="mt-2 whitespace-pre-line text-sm">
          {overview.changeRequest.reason}
        </p>
        <p className="mt-2 text-xs text-amber-800/80">
          Requested {formatDateTime(overview.changeRequest.requestedAt)}. Upload
          a new copy of the highlighted documents, then resubmit for review.
        </p>
      </div>
    );
  }
  if (overview.status === "REJECTED") {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900"
      >
        <p className="flex items-center gap-2 font-semibold">
          <XCircle className="h-4 w-4" /> KYC verification rejected
        </p>
        {overview.rejectedReason ? (
          <p className="mt-2 whitespace-pre-line text-sm">
            {overview.rejectedReason}
          </p>
        ) : null}
        <p className="mt-2 text-xs">
          Fix the issues below and resubmit, or contact support.
        </p>
      </div>
    );
  }
  if (overview.status === "APPROVED") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
        <CheckCircle2 className="h-4 w-4" /> Your business KYC is verified.
      </div>
    );
  }
  if (overview.status === "SUBMITTED") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Clock className="h-4 w-4 shrink-0" />
        Under review since{" "}
        {formatDateTime(overview.submittedAt) ?? "submission"}. You can only
        replace documents the PetroTrade team rejects.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
      Upload your business documents and submit them for verification.
    </div>
  );
}

const DOC_STATUS: Record<string, { label: string; className: string }> = {
  UNDER_REVIEW: { label: "Under review", className: "bg-sky-50 text-sky-700" },
  UPLOADED: { label: "Uploaded", className: "bg-sky-50 text-sky-700" },
  VERIFIED: { label: "Verified", className: "bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700" },
};

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
  const badge = doc ? DOC_STATUS[doc.status] : undefined;
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

export function CustomerKycPage() {
  const [overview, setOverview] = useState<CustomerKycOverview | null>(null);
  const [details, setDetails] = useState<BusinessDetails>({
    businessName: "",
    gstin: "",
    pan: "",
  });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const controllers = useRef(new Map<string, AbortController>());

  const apply = useCallback((next: CustomerKycOverview) => {
    setOverview(next);
    setDetails(detailsFrom(next));
  }, []);

  const reload = useCallback(async () => {
    const next = await fetchCustomerKyc();
    setOverview(next);
    return next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCustomerKyc()
      .then((next) => {
        if (!cancelled) apply(next);
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(customerKycError(error, "Could not load your KYC"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    const pending = controllers.current;
    return () => {
      cancelled = true;
      pending.forEach((controller) => controller.abort());
    };
  }, [apply]);

  const retry = () => {
    setLoadError(null);
    setLoading(true);
    fetchCustomerKyc()
      .then(apply)
      .catch((error) =>
        setLoadError(customerKycError(error, "Could not load your KYC")),
      )
      .finally(() => setLoading(false));
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
            onClick={retry}
          >
            Retry
          </button>
        </div>
      </PageContainer>
    );
  }

  const locked = overview.locked;
  const uploading = Object.keys(progress).length > 0;
  const gstinError =
    details.gstin && !GSTIN_PATTERN.test(details.gstin)
      ? "Enter a valid 15-character GSTIN"
      : null;
  const panError =
    details.pan && !PAN_PATTERN.test(details.pan)
      ? "Enter a valid 10-character PAN"
      : null;

  const submit = async () => {
    if (overview.missingRequired.length) {
      toast.error(
        `Upload required documents: ${overview.missingRequired.join(", ")}`,
      );
      return;
    }
    if (gstinError || panError) {
      toast.error("Fix the highlighted business details first");
      return;
    }
    setSubmitting(true);
    try {
      apply(await submitCustomerKyc(details));
      toast.success(
        "Submitted for review. We'll notify you once it is verified.",
      );
    } catch (error) {
      toast.error(customerKycError(error, "Could not submit for review"));
    } finally {
      setSubmitting(false);
    }
  };

  const upper = (value: string) => value.toUpperCase().replace(/\s/g, "");

  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Business KYC"
        description="Documents are stored securely and reviewed by the PetroTrade compliance team."
        breadcrumbs={[
          { label: "Profile", href: ROUTES.profile },
          { label: "Business KYC" },
        ]}
      />

      <StatusBanner overview={overview} />

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
          PDF, JPG, PNG or WEBP up to 10 MB.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border bg-white p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Business details
          </h2>
          <p className="text-xs text-slate-500">
            {locked
              ? "Locked while under review."
              : "Optional. Must match the documents above; saved when you submit."}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="kyc-business-name">Legal business name</Label>
            <Input
              id="kyc-business-name"
              value={details.businessName}
              disabled={locked || submitting}
              onChange={(event) =>
                setDetails((prev) => ({
                  ...prev,
                  businessName: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="kyc-gstin">GSTIN</Label>
            <Input
              id="kyc-gstin"
              value={details.gstin}
              maxLength={15}
              disabled={locked || submitting}
              onChange={(event) =>
                setDetails((prev) => ({
                  ...prev,
                  gstin: upper(event.target.value),
                }))
              }
            />
            {!locked && gstinError ? (
              <p className="text-xs text-destructive">{gstinError}</p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="kyc-pan">PAN</Label>
            <Input
              id="kyc-pan"
              value={details.pan}
              maxLength={10}
              disabled={locked || submitting}
              onChange={(event) =>
                setDetails((prev) => ({
                  ...prev,
                  pan: upper(event.target.value),
                }))
              }
            />
            {!locked && panError ? (
              <p className="text-xs text-destructive">{panError}</p>
            ) : null}
          </div>
        </div>
      </section>

      {!locked ? (
        <div className="flex flex-col items-end gap-2">
          {overview.missingRequired.length ? (
            <p className="text-xs text-amber-700">
              Still required: {overview.missingRequired.join(", ")}
            </p>
          ) : null}
          <Button
            type="button"
            disabled={submitting || uploading || !overview.canSubmit}
            onClick={() => void submit()}
          >
            {submitting
              ? "Submitting…"
              : kycNeedsAction(overview.status)
                ? "Resubmit for review"
                : "Submit for review"}
          </Button>
        </div>
      ) : null}
    </PageContainer>
  );
}
