"use client";

import {
  AlertTriangle,
  Clock3,
  CreditCard,
  Download,
  FileText,
  History,
  IndianRupee,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaymentsDashboardSummary } from "@/types/payments";
import type { LucideIcon } from "lucide-react";

interface SummaryCardsProps {
  summary: PaymentsDashboardSummary;
  className?: string;
}

export function PaymentSummaryCards({ summary, className }: SummaryCardsProps) {
  const items: Array<{
    label: string;
    value: string;
    hint?: string;
    icon: LucideIcon;
    tone?: string;
  }> = [
    {
      label: "Total Outstanding",
      value: formatInr(summary.totalOutstanding, { compact: true }),
      icon: IndianRupee,
      tone: "text-brand",
    },
    {
      label: "Paid This Month",
      value: formatInr(summary.paidThisMonth, { compact: true }),
      icon: Wallet,
      tone: "text-emerald-600",
    },
    {
      label: "Pending Payments",
      value: String(summary.pendingPayments),
      icon: Clock3,
      tone: "text-amber-600",
    },
    {
      label: "Upcoming Credit Due",
      value: formatInr(summary.upcomingCreditDue, { compact: true }),
      icon: CreditCard,
    },
    {
      label: "Overdue Payments",
      value: String(summary.overduePayments),
      icon: AlertTriangle,
      tone: "text-red-600",
    },
    {
      label: "Available Credit",
      value: formatInr(summary.availableCredit, { compact: true }),
      icon: Wallet,
      tone: "text-sky-600",
    },
  ];

  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6",
        className,
      )}
    >
      {items.map((item) => (
        <Card key={item.label} className="border-slate-200 shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-xl bg-brand/5 p-2.5 text-brand">
              <item.icon className={cn("h-5 w-5", item.tone)} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {item.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PaymentQuickActions() {
  const router = useRouter();
  return (
    <Card className="border-slate-200 shadow-card">
      <CardContent className="flex flex-wrap gap-2 p-4">
        <p className="mb-1 w-full text-xs font-semibold uppercase tracking-wide text-slate-500">
          Quick Actions
        </p>
        <Button
          className="rounded-xl bg-brand hover:bg-brand-700"
          onClick={() => router.push(ROUTES.paymentsAdvance)}
        >
          <IndianRupee className="h-4 w-4" />
          Pay Now
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push(ROUTES.paymentsInvoices)}
        >
          <Download className="h-4 w-4" />
          Download Invoice
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push(ROUTES.paymentsReceipts)}
        >
          <FileText className="h-4 w-4" />
          Download Receipt
        </Button>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push(ROUTES.paymentsHistory)}
        >
          <History className="h-4 w-4" />
          Payment History
        </Button>
      </CardContent>
    </Card>
  );
}
