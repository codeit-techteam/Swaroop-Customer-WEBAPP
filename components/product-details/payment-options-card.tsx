"use client";

import { useState } from "react";
import type { PaymentMethodId, PaymentOption } from "@/types/product-details";
import { cn } from "@/lib/utils";

interface PaymentOptionsCardProps {
  options: PaymentOption[];
  selectedId?: PaymentMethodId;
  onSelect?: (id: PaymentMethodId) => void;
  compact?: boolean;
  className?: string;
}

export function PaymentOptionsCard({
  options,
  selectedId: selectedIdProp,
  onSelect,
  compact = false,
  className,
}: PaymentOptionsCardProps) {
  const eligible = options.filter((option) => option.eligible);
  const [internalId, setInternalId] = useState<PaymentMethodId | null>(
    eligible[0]?.id ?? null,
  );
  const isControlled =
    selectedIdProp !== undefined && typeof onSelect === "function";
  const selectedId = isControlled ? selectedIdProp : internalId;
  const selected = eligible.find((option) => option.id === selectedId);

  function handleSelect(id: PaymentMethodId) {
    if (isControlled) {
      onSelect(id);
    } else {
      setInternalId(id);
    }
  }

  return (
    <div
      className={cn(
        compact
          ? "space-y-2"
          : "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <div>
        <h3
          className={cn(
            "font-semibold text-slate-900",
            compact ? "text-xs uppercase tracking-wide text-slate-500" : "text-sm",
          )}
        >
          Payment Method
        </h3>
        {!compact ? (
          <p className="mt-0.5 text-xs text-slate-500">
            Eligible methods for this grade
          </p>
        ) : null}
      </div>

      <ul
        className={cn(compact ? "space-y-1.5" : "mt-3 space-y-2")}
        role="radiogroup"
        aria-label="Payment options"
      >
        {eligible.map((option) => {
          const isSelected = option.id === selectedId;
          return (
            <li key={option.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!option.eligible}
                onClick={() => {
                  if (option.eligible) handleSelect(option.id);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl border text-left transition-colors",
                  compact ? "px-2.5 py-2" : "items-start px-3 py-2.5",
                  isSelected
                    ? "border-brand/30 bg-brand/5"
                    : "border-slate-100 bg-slate-50/70 hover:border-slate-200",
                  !option.eligible && "cursor-not-allowed opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    compact ? "mt-0" : "mt-0.5",
                    isSelected
                      ? "border-brand bg-brand"
                      : "border-slate-300 bg-white",
                  )}
                  aria-hidden="true"
                >
                  {isSelected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {option.title}
                    </p>
                    {option.surchargeLabel ? (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {option.surchargeLabel}
                      </span>
                    ) : null}
                  </div>
                  {!compact ? (
                    <p className="text-xs text-slate-500">{option.description}</p>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80">
            Selected Payment
          </p>
          <p className="text-sm font-semibold text-slate-900">{selected.title}</p>
          {selected.benefitLabel ? (
            <p className="text-xs font-medium text-emerald-700">
              {selected.benefitLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
