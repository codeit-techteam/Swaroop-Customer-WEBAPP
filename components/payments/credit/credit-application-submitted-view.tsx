"use client";

import { Check } from "lucide-react";
import type { SubmittedCreditApplication } from "@/types/credit-application";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CreditApplicationSubmittedViewProps {
  application: SubmittedCreditApplication;
}

const TIMELINE = [
  { id: "submitted", label: "Submitted", state: "complete" as const },
  { id: "review", label: "Under Review", state: "current" as const },
  { id: "approved", label: "Approved", state: "upcoming" as const },
  { id: "activated", label: "Credit Activated", state: "upcoming" as const },
];

function termLabel(term: SubmittedCreditApplication["creditTerm"]): string {
  return term === "net_15" ? "Net-15" : "Net-30";
}

export function CreditApplicationSubmittedView({
  application,
}: CreditApplicationSubmittedViewProps) {
  return (
    <div className="space-y-4">
      <Card className="border-brand/20 bg-brand/[0.02] shadow-card">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">Application Submitted</CardTitle>
            <Badge variant="warning" className="rounded-full">
              Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Application ID"
              value={application.applicationId}
              mono
            />
            <Field label="Status" value="Pending Review" />
            <Field
              label="Requested Credit"
              value={formatInr(application.requestedLimit)}
            />
            <Field
              label="Requested Term"
              value={termLabel(application.creditTerm)}
            />
            <Field
              label="Submitted On"
              value={formatDateDdMmYyyy(application.submittedAt)}
            />
          </dl>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-0 pl-1">
            {TIMELINE.map((step, idx) => (
              <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                {idx < TIMELINE.length - 1 ? (
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
                <p
                  className={cn(
                    "pt-0.5 text-sm font-medium",
                    step.state === "complete" && "text-emerald-700",
                    step.state === "current" && "text-brand",
                    step.state === "upcoming" && "text-slate-400",
                  )}
                >
                  {step.label}
                </p>
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
