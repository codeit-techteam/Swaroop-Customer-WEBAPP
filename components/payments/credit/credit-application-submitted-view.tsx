"use client";

import { Check, Clock, FileText, ShieldCheck } from "lucide-react";
import type { SubmittedCreditApplication } from "@/types/credit-application";
import {
  creditTermLabel,
  CREDIT_REVIEW_SLA_LABEL,
  monthlyPurchaseLabel,
} from "@/lib/credit-application";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreditApplicationSubmittedViewProps {
  application: SubmittedCreditApplication;
  hasActiveFacility?: boolean;
}

const UNDERWRITING = [
  {
    id: "submitted",
    label: "Application received",
    detail: "Reference logged with the credit desk.",
    state: "complete" as const,
  },
  {
    id: "kyc",
    label: "Document verification",
    detail: "GST, bank statements, and financials are being checked.",
    state: "current" as const,
  },
  {
    id: "committee",
    label: "Credit assessment",
    detail: "Limit, tenor, and exposure are underwritten.",
    state: "upcoming" as const,
  },
  {
    id: "decision",
    label: "Decision & activation",
    detail: "You will be notified when the facility is approved or declined.",
    state: "upcoming" as const,
  },
];

export function CreditApplicationSubmittedView({
  application,
  hasActiveFacility = false,
}: CreditApplicationSubmittedViewProps) {
  const isPending = application.status === "pending_review";

  return (
    <div className="space-y-4">
      <Card className="border-brand/20 bg-brand/[0.02] shadow-card">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Application submitted</CardTitle>
            <Badge variant="warning" className="rounded-full">
              Pending review
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            Your file is locked for underwriting. Existing trading credit, if
            any, stays active until a decision is made.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Application ID"
              value={application.applicationId}
              mono
            />
            <Field
              label="Requested credit"
              value={formatInr(application.requestedLimit)}
            />
            <Field
              label="Requested term"
              value={creditTermLabel(application.creditTerm)}
            />
            <Field
              label="Monthly volume"
              value={monthlyPurchaseLabel(application.monthlyPurchase)}
            />
            <Field
              label="Submitted on"
              value={formatDateDdMmYyyy(application.submittedAt)}
            />
            <Field
              label="Expected decision by"
              value={formatDateDdMmYyyy(application.estimatedDecisionBy)}
            />
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

      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Documents on this file</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-slate-100">
            {application.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {doc.title}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {doc.fileName}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={doc.source === "onboarding" ? "outline" : "success"}
                  className="shrink-0 rounded-full text-[10px]"
                >
                  {doc.source === "onboarding" ? "On file" : "Uploaded"}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Underwriting timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-0 pl-1">
            {UNDERWRITING.map((step, idx) => (
              <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                {idx < UNDERWRITING.length - 1 ? (
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
                  <p className="mt-0.5 text-xs text-slate-500">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
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
