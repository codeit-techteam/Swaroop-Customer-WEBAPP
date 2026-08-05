"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface OrdersKpiItem {
  id?: string;
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
}

interface OrdersKpiCardsProps {
  items: OrdersKpiItem[];
  /** Optional trailing card (e.g. attention KPI). */
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
      {items.map((item) => {
        const clickable = Boolean(item.onClick);
        return (
          <Card
            key={item.id ?? item.label}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-pressed={clickable ? Boolean(item.active) : undefined}
            onClick={item.onClick}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      item.onClick?.();
                    }
                  }
                : undefined
            }
            className={cn(
              "border-slate-200 shadow-card transition-colors",
              clickable && "cursor-pointer hover:border-slate-300",
              item.active && "border-brand/40 ring-2 ring-brand/30",
            )}
          >
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
        );
      })}
      {append}
    </div>
  );
}

export function formatKpiValue(amount: number): string {
  return formatInr(amount, { compact: true });
}
