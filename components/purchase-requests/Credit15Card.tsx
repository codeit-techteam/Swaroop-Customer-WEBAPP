"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import type { CreditEligibility } from "@/types/purchase-request";

interface Credit15CardProps {
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

export function Credit15Card({ eligibility, orderAmount }: Credit15CardProps) {
  const interest = Math.round(orderAmount * (eligibility.interest15 / 100));

  return (
    <Card className="border-emerald-200 bg-emerald-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-emerald-900">
          <Calendar className="h-4 w-4" aria-hidden />
          Credit 15 Days Summary
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
            <dt className="text-[11px] text-slate-500">Credit Used</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {formatInr(eligibility.creditUsed, { compact: true })}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Interest (1.5%)</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {formatInr(interest, { compact: true })}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Eligibility</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {eligibility.eligibleFor15 ? "Approved" : "Not eligible"}
            </dd>
          </div>
          <div className="rounded-xl bg-white p-3">
            <dt className="text-[11px] text-slate-500">Payment Due Date</dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {addDays(15)} · Net 15
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
