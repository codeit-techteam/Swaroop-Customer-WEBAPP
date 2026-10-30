"use client";

import { useState } from "react";
import type {
  CreditAccessView,
  CreditCtaType,
  CreditLoadState,
} from "@/types/payment-eligibility";
import { shouldRenderCreditInfo } from "@/types/payment-eligibility";
import type { PaymentMethodId, PaymentOption } from "@/types/product-details";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaymentOptionsCardProps {
  options: PaymentOption[];
  selectedId?: PaymentMethodId;
  onSelect?: (id: PaymentMethodId) => void;
  creditAccess?: CreditAccessView | null;
  creditStatus?: CreditLoadState;
  onRetryCredit?: () => void;
  onCreditCta?: (type: CreditCtaType) => void;
  compact?: boolean;
  className?: string;
}

function formatLimit(value: string | null | undefined, currency = "INR") {
  if (value == null || value === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return `${currency} ${Math.round(amount).toLocaleString("en-IN")}`;
}

function isCreditOption(option: PaymentOption) {
  return option.id.startsWith("credit");
}

export function PaymentOptionsCard({
  options,
  selectedId: selectedIdProp,
  onSelect,
  creditAccess,
  creditStatus = "idle",
  onRetryCredit,
  onCreditCta,
  compact = false,
  className,
}: PaymentOptionsCardProps) {
  const visible = options.filter((option) => option.title?.trim());
  const selectable = visible.filter((option) => option.eligible);
  const [internalId, setInternalId] = useState<PaymentMethodId | null>(
    selectable[0]?.id ?? null,
  );
  const isControlled =
    selectedIdProp !== undefined && typeof onSelect === "function";
  const selectedId = isControlled ? selectedIdProp : internalId;
  const selected = selectable.find((option) => option.id === selectedId);
  const hasLockedCredit = visible.some(
    (option) => isCreditOption(option) && !option.eligible,
  );
  // Locked credit rows already advertise Request Credit for first-time buyers.
  const showCreditCard =
    creditStatus !== "loading" &&
    creditStatus !== "error" &&
    shouldRenderCreditInfo(creditAccess) &&
    !creditAccess?.eligible &&
    !(hasLockedCredit && creditAccess?.state === "NOT_APPLIED");
  const submittedAt = creditAccess?.application?.submittedAt;
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
  const account = creditAccess?.account;
  const ctaType = creditAccess?.cta?.type ?? "REQUEST_CREDIT";
  const ctaLabel = creditAccess?.cta?.label ?? "Request Credit";

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
            compact
              ? "text-xs uppercase tracking-wide text-slate-500"
              : "text-sm",
          )}
        >
          Payment Method
        </h3>
        {!compact ? (
          <p className="mt-0.5 text-xs text-slate-500">
            Eligible methods for this grade — credit stays visible even before
            you apply
          </p>
        ) : null}
      </div>

      <ul
        className={cn(compact ? "space-y-1.5" : "mt-3 space-y-2")}
        role="radiogroup"
        aria-label="Payment options"
      >
        {visible.map((option) => {
          const locked = !option.eligible;
          const isSelected = !locked && option.id === selectedId;
          const saveLabel =
            option.discountRate && option.discountRate > 0
              ? `Save ${
                  (option.discountRate * 100) % 1 === 0
                    ? (option.discountRate * 100).toFixed(0)
                    : (option.discountRate * 100).toFixed(2)
                }%`
              : option.surchargeLabel;
          const unlockLabel =
            option.benefitLabel?.trim() ||
            (isCreditOption(option) ? ctaLabel : null);

          return (
            <li key={option.id}>
              {locked ? (
                <div
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 text-left",
                    compact ? "px-2.5 py-2" : "px-3 py-2.5",
                  )}
                >
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {option.title}
                      </p>
                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                        Available for credit
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {option.description}
                    </p>
                    {option.dueLabel ? (
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {option.dueLabel}
                      </p>
                    ) : null}
                    {onCreditCta && isCreditOption(option) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 h-8 rounded-lg border-brand/30 text-xs font-semibold text-brand hover:bg-brand/5"
                        onClick={() => onCreditCta(ctaType)}
                      >
                        {unlockLabel}
                      </Button>
                    ) : unlockLabel ? (
                      <p className="mt-1 text-[11px] font-medium text-amber-800">
                        {unlockLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl border text-left transition-colors",
                    compact ? "px-2.5 py-2" : "px-3 py-2.5",
                    isSelected
                      ? "border-brand/30 bg-brand/5"
                      : "border-slate-100 bg-slate-50/70 hover:border-slate-200",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
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
                      {saveLabel ? (
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {saveLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      {option.description}
                    </p>
                    {option.dueLabel ? (
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {option.dueLabel}
                      </p>
                    ) : null}
                  </div>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {creditStatus === "loading" ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-xs text-slate-500">
          Checking credit eligibility…
        </p>
      ) : null}

      {creditStatus === "error" ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
          <p className="text-sm font-semibold text-slate-900">
            {creditAccess?.title || "Unable to load credit options"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {creditAccess?.message ||
              "We could not verify business credit for this order. Other payment methods remain available."}
          </p>
          {onRetryCredit ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-3 h-9 w-full rounded-lg"
              onClick={onRetryCredit}
            >
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      {showCreditCard && creditAccess ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
          <p className="text-sm font-semibold text-slate-900">
            {creditAccess.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {creditAccess.message}
          </p>
          {creditAccess.state === "APPLICATION_PENDING" && submittedLabel ? (
            <p className="mt-1 text-[11px] text-slate-500">
              Submitted {submittedLabel}
              {creditAccess.application?.displayStatus
                ? ` · ${creditAccess.application.displayStatus}`
                : ""}
            </p>
          ) : null}
          {creditAccess.state === "LIMIT_EXCEEDED" && account ? (
            <p className="mt-1 text-[11px] text-slate-500">
              Approved{" "}
              {formatLimit(account.approvedLimit, account.currency) ?? "—"} ·
              Used{" "}
              {formatLimit(account.utilizedAmount, account.currency) ?? "—"} ·
              Available{" "}
              {formatLimit(account.availableLimit, account.currency) ?? "—"}
            </p>
          ) : null}
          {creditAccess.cta && onCreditCta ? (
            <Button
              type="button"
              size="sm"
              className="mt-3 h-9 w-full rounded-lg bg-brand text-white hover:bg-brand/90"
              onClick={() => onCreditCta(creditAccess.cta!.type)}
            >
              {creditAccess.cta.label}
            </Button>
          ) : null}
        </div>
      ) : null}

      {creditAccess?.state === "APPROVED" &&
      creditAccess.eligible &&
      account ? (
        <p className="text-[11px] text-slate-500">
          Approved {formatLimit(account.approvedLimit, account.currency) ?? "—"}{" "}
          · Used {formatLimit(account.utilizedAmount, account.currency) ?? "—"}{" "}
          · Available{" "}
          {formatLimit(account.availableLimit, account.currency) ?? "—"}
          {selected?.id.startsWith("credit") ? ` · ${selected.title}` : ""}
        </p>
      ) : null}

      {selected ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80">
            Selected Payment
          </p>
          <p className="text-sm font-semibold text-slate-900">
            {selected.title}
          </p>
          {selected.benefitLabel ? (
            <p className="text-xs font-medium text-emerald-700">
              {selected.benefitLabel}
            </p>
          ) : selected.dueLabel ? (
            <p className="text-xs text-slate-500">{selected.dueLabel}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
