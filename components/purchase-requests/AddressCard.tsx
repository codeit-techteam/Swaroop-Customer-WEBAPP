"use client";

import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatInr } from "@/lib/format";
import type { ShippingAddress } from "@/types/purchase-request";

interface AddressCardProps {
  address: ShippingAddress;
  selected?: boolean;
  onSelect?: (id: string) => void;
  showFreight?: boolean;
  title?: string;
  className?: string;
}

export function AddressCard({
  address,
  selected = false,
  onSelect,
  showFreight = true,
  title,
  className,
}: AddressCardProps) {
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
          {title ? (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>
          ) : null}
          <CardTitle className="text-sm">{address.warehouseName}</CardTitle>
          <p className="mt-0.5 text-xs text-slate-500">{address.zoneLabel}</p>
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
      <CardContent className="space-y-2 p-4 pt-0">
        <p className="flex items-start gap-2 text-sm text-slate-600">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>
            {address.line1}, {address.line2}
            <br />
            {address.state} — {address.pincode}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>ETA {address.etaLabel}</span>
          {showFreight ? (
            <span className="font-medium text-slate-700">
              Freight {formatInr(address.freightAmount, { compact: true })}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
