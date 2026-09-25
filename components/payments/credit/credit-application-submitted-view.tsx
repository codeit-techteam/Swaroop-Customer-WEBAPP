"use client";

import { Check, Clock, FileText, ShieldCheck } from "lucide-react";
import type {
  CreditApplicationStatus,
  CreditApplicationView,
  MonthlyPurchaseBand,
} from "@/types/credit-application";
import {
  CREDIT_REVIEW_BUSINESS_DAYS,
  CREDIT_REVIEW_SLA_LABEL,
  addBusinessDays,
  creditStatusBadgeVariant,
  creditStatusLabel,
  creditTermFromTenureDays,
  creditTermLabel,
  isCreditReviewStatus,
  monthlyPurchaseLabel,
} from "@/lib/credit-application";
import { CREDIT_DOCUMENT_DEFINITIONS } from "@/mock/credit-application";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreditApplicationSubmittedViewProps {
  application: CreditApplicationView;
  monthlyPurchase?: MonthlyPurchaseBand | "";
  hasActiveFacility?: boolean;
}

type TimelineState = "complete" | "current" | "upcoming";

function underwritingSteps(status: CreditApplicationStatus): Array<{
  id: string;
  label: string;
  detail: string;
  state: TimelineState;
}> {
  const decided =
    status === "APPROVED" ||
    status === "PARTIALLY_APPROVED" ||
    status === "REJECTED";
  const inReview = isCreditReviewStatus(status) || status === "PENDING";

  return [
    {
      id: "submitted",
      label: "Application received",
      detail: "Reference logged with the credit desk.",
      state: "complete",
    },
    {
      id: "kyc",
      label: "Document verification",
      detail: "GST, bank statements, and financials are being checked.",
      state: decided
        ? "complete"
        : status === "DOCUMENTS_UNDER_REVIEW"
          ? "current"
          : inReview
            ? "current"
            : "upcoming",
    },
    {
      id: "committee",
      label: "Credit assessment",
      detail: "Limit, tenor, and exposure are underwritten.",
      state: decided
        ? "complete"
        : status === "UNDER_REVIEW" ||
            status === "INSURANCE_REVIEW" ||
            status === "CREDIT_ARRANGEMENT_PENDING"
          ? "current"
          : "upcoming",
    },
    {
      id: "decision",
      label: "Decision & activation",
      detail: "You will be notified when the facility is approved or declined.",
      state: decided ? "complete" : "upcoming",
    },
  ];
}

function documentTitle(documentType: string): string {
  return (
    CREDIT_DOCUMENT_DEFINITIONS.find((d) => d.id === documentType)?.title ??
    documentType
  );
}

export function CreditApplicationSubmittedView({
  application,
  monthlyPurchase = "",
  hasActiveFacility = false,
}: CreditApplicationSubmittedViewProps) {
  const status = application.status;
  const isPending = isCreditReviewStatus(status) || status === "PENDING";
  const requestedLimit = Number(application.requestedLimit);
  const term = creditTermFromTenureDays(application.requestedTenureDays);
  const submittedAt = application.submittedAt ?? application.createdAt;
  const estimatedDecisionBy = application.decidedAt
    ? application.decidedAt
    : addBusinessDays(submittedAt, CREDIT_REVIEW_BUSINESS_DAYS);
  const timeline = underwritingSteps(status);
  const activeDocs = (application.documents ?? []).filter(
    (doc) => doc.status !== "ARCHIVED" && doc.status !== "REPLACED",
  );

  return (
    <div className="space-y-4">
      <Card className="border-brand/20 bg-brand/[0.02] shadow-card">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">
              {status === "APPROVED" || status === "PARTIALLY_APPROVED"
                ? "Application decided"
                : status === "REJECTED"
                  ? "Application decided"
                  : "Application submitted"}
            </CardTitle>
            <Badge
              variant={creditStatusBadgeVariant(status)}
              className="rounded-full"
            >
              {creditStatusLabel(status)}
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            {application.customerMessage ??
              (isPending
                ? "Your file is locked for underwriting. Existing trading credit, if any, stays active until a decision is made."
                : "Latest status from the PetroTrade credit desk.")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Application ID"
              value={application.applicationNumber}
              mono
            />
            <Field
              label="Requested credit"
              value={
                Number.isFinite(requestedLimit)
                  ? formatInr(requestedLimit)
                  : "—"
              }
            />
            <Field label="Requested term" value={creditTermLabel(term)} />
            {monthlyPurchase ? (
              <Field
                label="Monthly volume"
                value={monthlyPurchaseLabel(monthlyPurchase)}
              />
            ) : null}
            <Field
              label="Submitted on"
              value={formatDateDdMmYyyy(submittedAt)}
            />
            <Field
              label={
                application.decidedAt ? "Decided on" : "Expected decision by"
              }
              value={formatDateDdMmYyyy(estimatedDecisionBy)}
            />
            {application.approvedLimit != null ? (
              <Field
                label="Approved limit"
                value={formatInr(Number(application.approvedLimit) || 0)}
              />
            ) : null}
          </dl>

          <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <p>
              Typical review time is <strong>{CREDIT_REVIEW_SLA_LABEL}</strong>.
              You will receive a notification when the credit desk decides.
            </p>
          </div>

          {hasActiveFacility && isPending ? (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900 ring-1 ring-emerald-100">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p>
                Your current facility remains available for Net-15 / Net-30
                orders while this request is reviewed.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {application.purpose ? (
        <Card className="border-slate-200 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Purpose</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-slate-700">
              {application.purpose}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Documents on this file</CardTitle>
        </CardHeader>
        <CardContent>
          {activeDocs.length === 0 ? (
            <p className="text-sm text-slate-500">No documents uploaded yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activeDocs.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {doc.label || documentTitle(doc.documentType)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {doc.fileName}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      doc.status === "REJECTED"
                        ? "destructive"
                        : doc.status === "VERIFIED"
                          ? "success"
                          : "outline"
                    }
                    className="shrink-0 rounded-full text-[10px]"
                  >
                    {doc.status === "REJECTED"
                      ? "Rejected"
                      : doc.status === "VERIFIED"
                        ? "Verified"
                        : doc.storagePending
                          ? "Pending storage"
                          : "Uploaded"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {application.timeline && application.timeline.length > 0 ? (
        <Card className="border-slate-200 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {application.timeline
                .filter((event) => event.customerVisible !== false)
                .map((event) => (
                  <li key={event.id} className="text-sm">
                    <p className="font-medium text-slate-900">
                      {event.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateDdMmYyyy(event.createdAt)}
                    </p>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Underwriting timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-0 pl-1">
              {timeline.map((step, idx) => (
                <li
                  key={step.id}
                  className="relative flex gap-4 pb-8 last:pb-0"
                >
                  {idx < timeline.length - 1 ? (
                    <span
                      className={cn(
                        "absolute left-[11px] top-6 h-[calc(100%-12px)] w-px",
                        step.state === "complete"
                          ? "bg-emerald-300"
                          : "bg-slate-200",
                      )}
                      aria-hidden="true"
                    />
                  ) : null}
                  <div
                    className={cn(
                      "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                      step.state === "complete" && "bg-emerald-500 text-white",
                      step.state === "current" &&
                        "border-2 border-brand bg-white text-brand",
                      step.state === "upcoming" &&
                        "border border-slate-200 bg-white text-slate-300",
                    )}
                  >
                    {step.state === "complete" ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        step.state === "complete" && "text-emerald-700",
                        step.state === "current" && "text-brand",
                        step.state === "upcoming" && "text-slate-400",
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm font-semibold text-slate-900",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
