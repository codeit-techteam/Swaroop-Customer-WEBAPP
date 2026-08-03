"use client";

import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BillingAddress } from "@/types/purchase-request";

interface BillingCardProps {
  address: BillingAddress;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

export function BillingCard({
  address,
  selected = false,
  onSelect,
  className,
}: BillingCardProps) {
  const interactive = Boolean(onSelect);

  return (
    <Card
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onSelect?.(address.id) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(address.id);
              }
            }
          : undefined
      }
      className={cn(
        "border-slate-200 transition-all",
        interactive && "cursor-pointer hover:border-brand/40",
        selected && "border-brand ring-2 ring-brand/15",
        className,
      )}
    >
      <CardHeader className="flex-row items-start justify-between space-y-0 p-4 pb-2">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {address.label}
          </p>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            {address.companyName}
          </CardTitle>
        </div>
        {interactive ? (
          <span
            className={cn(
              "mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2",
              selected ? "border-brand" : "border-slate-300",
            )}
            aria-hidden
          >
            {selected ? (
              <span className="h-2 w-2 rounded-full bg-brand" />
            ) : null}
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0 text-sm text-slate-600">
        <p>
          {address.line1}, {address.line2}
        </p>
        <p>
          {address.city}, {address.state} — {address.pincode}
        </p>
        <p className="pt-1 text-xs font-medium text-slate-700">
          GSTIN {address.gstin}
        </p>
      </CardContent>
    </Card>
  );
}
