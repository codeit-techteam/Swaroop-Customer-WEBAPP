"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface OrdersKpiItem {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

interface OrdersKpiCardsProps {
  items: OrdersKpiItem[];
  /** Optional trailing card (e.g. richer Avg Delivery Time). */
  append?: ReactNode;
  className?: string;
}

export function OrdersKpiCards({
  items,
  append,
  className,
}: OrdersKpiCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        append || items.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <Card key={item.label} className="border-slate-200 shadow-card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="rounded-xl bg-brand/5 p-2.5 text-brand">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {item.value}
              </p>
              {item.hint ? (
                <p className="mt-0.5 text-xs text-slate-500">{item.hint}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
      {append}
    </div>
  );
}

export function formatKpiValue(amount: number): string {
  return formatInr(amount, { compact: true });
}
