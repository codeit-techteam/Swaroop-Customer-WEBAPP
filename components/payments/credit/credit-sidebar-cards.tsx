"use client";

import { Info, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ELIGIBILITY = [
  "Minimum 6 Months Business",
  "Valid GST Registration",
  "PAN Mandatory",
  "Bank Statements Required",
  "Financial Documents Required",
];

const BENEFITS = [
  "Purchase without immediate payment",
  "Higher buying power",
  "Net-15 / Net-30 terms",
  "Fast procurement",
  "Secure B2B financing",
];

interface CreditSidebarCardsProps {
  className?: string;
}

export function CreditSidebarCards({ className }: CreditSidebarCardsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Eligibility Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {ELIGIBILITY.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-brand" />
            Why Apply for Credit?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div>
            <p className="text-sm font-semibold text-sky-900">
              Important Notice
            </p>
            <p className="mt-1 text-xs leading-relaxed text-sky-800/90">
              Approval depends on business verification and submitted financial
              documents. Submitting an application does not guarantee credit
              approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
