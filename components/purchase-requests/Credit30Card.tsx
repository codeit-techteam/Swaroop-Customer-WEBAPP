"use client";

import { CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import type { CreditEligibility } from "@/types/purchase-request";

interface Credit30CardProps {
  eligibility: CreditEligibility;
  orderAmount: number;
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function Credit30Card({ eligibility, orderAmount }: Credit30CardProps) {
  const interest = Math.round(orderAmount * (eligibility.interest30 / 100));

  return (
    <Card className="border-amber-200 bg-amber-50/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-amber-950">
          <CalendarCheck className="h-4 w-4" aria-hidden />
          Credit 30 Days Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Credit Limit</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {formatInr(eligibility.creditLimit, { compact: true })}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Available Balance</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {formatInr(eligibility.availableCredit, { compact: true })}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Interest (2.5%)</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {formatInr(interest, { compact: true })}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Late Charges</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              Apply after due date
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Eligibility</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {eligibility.eligibleFor30 ? "Premium Approved" : "Not eligible"}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Extended Due Date</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {addDays(30)} · Net 30
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
