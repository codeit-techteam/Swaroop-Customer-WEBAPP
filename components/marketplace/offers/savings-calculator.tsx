"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { calculateOfferSavings, isOfferPurchasable } from "@/lib/offer-utils";
import { getOfferQuoteHref } from "@/mock/offers";
import type { MarketplaceOffer } from "@/types/offers";
import { cn } from "@/lib/utils";

interface SavingsCalculatorProps {
  offer: MarketplaceOffer;
  quantityMt: number;
  onQuantityChange: (qty: number) => void;
  className?: string;
}

export function SavingsCalculator({
  offer,
  quantityMt,
  onQuantityChange,
  className,
}: SavingsCalculatorProps) {
  const purchasable = isOfferPurchasable(offer);
  const step = offer.moq >= 25 ? 5 : 1;
  const min = offer.moq;
  const max = Math.min(offer.remainingStock, offer.availableQuantity);

  const { regularTotal, offerTotal, savingsTotal, pricePerMt } =
    calculateOfferSavings(offer, quantityMt);

  const decrement = () => onQuantityChange(Math.max(min, quantityMt - step));
  const increment = () => onQuantityChange(Math.min(max, quantityMt + step));

  const quoteHref = getOfferQuoteHref(offer, { quantity: quantityMt });

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card",
        className,
      )}
    >
      <h4 className="text-sm font-semibold text-slate-900">Order Summary</h4>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Quantity
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={decrement}
            disabled={quantityMt <= min}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center text-lg font-bold tabular-nums text-slate-900">
            {formatQuantityMt(quantityMt)}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={increment}
            disabled={quantityMt >= max}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          MOQ {formatQuantityMt(offer.moq)} · Max {formatQuantityMt(max)}
        </p>
      </div>

      <dl className="mt-5 space-y-2.5 text-sm">
        <SummaryRow
          label="Rate / MT"
          value={formatInr(pricePerMt, { compact: true })}
        />
        <SummaryRow
          label="Regular Price"
          value={formatInr(regularTotal, { compact: true })}
          muted
        />
        <SummaryRow
          label="Offer Price"
          value={formatInr(offerTotal, { compact: true })}
          highlight
        />
        <SummaryRow
          label="You Save"
          value={formatInr(savingsTotal, { compact: true })}
          success
        />
        <SummaryRow
          label="GST"
          value="Calculated during purchase request"
          small
        />
      </dl>

      <Button
        asChild
        className="mt-5 h-11 w-full rounded-xl bg-brand font-semibold hover:bg-brand-700"
        disabled={!purchasable}
      >
        <Link href={purchasable ? quoteHref : "#"}>Continue with Offer</Link>
      </Button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
  success,
  muted,
  small,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
  muted?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium text-slate-800",
          highlight && "text-lg font-bold text-brand",
          success && "font-semibold text-emerald-700",
          muted && "text-slate-400 line-through",
          small && "max-w-[160px] text-xs text-slate-400",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
