"use client";

import Link from "next/link";
import { Layers3 } from "lucide-react";
import { formatInr } from "@/lib/format";
import { getOfferDetailHref } from "@/mock/offers";
import type { MarketplaceOffer } from "@/types/offers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BulkDiscountSectionProps {
  offers: MarketplaceOffer[];
  className?: string;
}

export function BulkDiscountSection({
  offers,
  className,
}: BulkDiscountSectionProps) {
  const bulkOffer =
    offers.find((o) => o.bulkTiers && o.bulkTiers.length > 0) ??
    offers.find((o) => o.offerType === "bulk_discount");

  if (!bulkOffer?.bulkTiers?.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card md:p-6",
        className,
      )}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Bulk Discount Tiers
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {`${bulkOffer.title} — volume pricing from PetroTrade Network`}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={getOfferDetailHref(bulkOffer.id)}>View Offer</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {bulkOffer.bulkTiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-brand/30 hover:bg-brand/[0.03]"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-brand">
              {tier.label}
            </p>
            <p className="mt-3 text-xs text-slate-400 line-through">
              {formatInr(tier.currentPrice, { compact: true })}
            </p>
            <p className="text-xl font-bold tabular-nums text-slate-900">
              {formatInr(tier.discountPrice, { compact: true })}
              <span className="ml-1 text-xs font-medium text-slate-400">
                / MT
              </span>
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-700">
              Save {formatInr(tier.savings, { compact: true })} / MT
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
