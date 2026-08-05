"use client";

import {
  BarChart3,
  Building2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Ticket,
  Truck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { computeOpenTicketCount, useSupportStore } from "@/store/supportStore";
import { cn } from "@/lib/utils";

const widgets = [
  {
    key: "openTickets" as const,
    label: "Support Tickets",
    suffix: "Open",
    icon: Ticket,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    key: "paymentVerificationPending" as const,
    label: "Payment Verification",
    suffix: "Pending",
    icon: CreditCard,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    key: "shipmentIssuesActive" as const,
    label: "Shipment Issues",
    suffix: "Active",
    icon: Truck,
    tone: "bg-orange-50 text-orange-700",
  },
  {
    key: "resolvedThisMonth" as const,
    label: "Resolved This Month",
    suffix: "",
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700",
  },
];

export function SupportStatusWidgets() {
  const summary = useSupportStore((s) => s.summary);
  const tickets = useSupportStore((s) => s.tickets);
  const openLive = computeOpenTicketCount(tickets);
  const values = {
    ...summary,
    openTickets: Math.max(summary.openTickets, openLive),
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {widgets.map((w) => {
        const Icon = w.icon;
        return (
          <Card
            key={w.key}
            className="overflow-hidden rounded-2xl border-slate-200/80 shadow-card transition-shadow hover:shadow-elevated"
          >
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  w.tone,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{w.label}</p>
                <p className="text-xl font-semibold tracking-tight text-brand">
                  {values[w.key]}
                  {w.suffix ? (
                    <span className="ml-1.5 text-sm font-medium text-slate-400">
                      {w.suffix}
                    </span>
                  ) : null}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export const SUPPORT_CATEGORY_META = [
  {
    id: "market-data",
    title: "Market Data Support",
    description:
      "Analyze historical trends, spot prices, warehouse differentials and grade benchmarks.",
    icon: BarChart3,
    cta: "Explore",
    action: "knowledge" as const,
  },
  {
    id: "payment",
    title: "Payment Verification",
    description:
      "Track UTR verification, invoice matching, payment status and bank remittance updates.",
    icon: ShieldCheck,
    cta: "Verify Status",
    action: "raise" as const,
    category: "payment" as const,
  },
  {
    id: "credit",
    title: "Credit Assistance",
    description:
      "Request limits, view collateral requirements, eligibility and temporary extensions.",
    icon: Building2,
    cta: "Request Credit",
    action: "raise" as const,
    category: "credit" as const,
  },
  {
    id: "shipment",
    title: "Shipment & Logistics",
    description:
      "Track fleet movement, manage terminal slots, transport documents and delivery issues.",
    icon: Truck,
    cta: "Track Shipment",
    action: "tickets" as const,
  },
];
