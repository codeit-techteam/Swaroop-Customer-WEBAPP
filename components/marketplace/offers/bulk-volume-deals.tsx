"use client";

import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatInrPerMt } from "@/lib/format";
import { getStartingBulkPrice } from "@/lib/offer-utils";
import { getOfferDetailHref } from "@/mock/offers";
import type { MarketplaceOffer } from "@/types/offers";
import { VolumePricing } from "./volume-pricing";
import { cn } from "@/lib/utils";

interface BulkVolumeDealsProps {
  offers: MarketplaceOffer[];
  className?: string;
}

export function BulkVolumeDeals({ offers, className }: BulkVolumeDealsProps) {
  const bulkOffers = offers
    .filter((o) => o.bulkTiers && o.bulkTiers.length > 0)
    .slice(0, 2);

  if (!bulkOffers.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card md:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand">
          <Layers3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Bulk / Volume Deals
          </h2>
          <p className="text-sm text-slate-500">
            Tiered pricing — save more at higher quantities
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {bulkOffers.map((offer) => {
          const starting = getStartingBulkPrice(offer);
          return (
            <div
              key={offer.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand">
                    {offer.badge}
                  </p>
                  <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
                    {offer.productName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {"Verified Supply Partner"} · Western India Region
                  </p>
                  {starting ? (
                    <p className="mt-2 text-sm">
                      Starting{" "}
                      <span className="font-bold text-brand">
                        {formatInrPerMt(starting)}
                      </span>
                    </p>
                  ) : null}
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-xl"
                >
                  <Link href={getOfferDetailHref(offer.id)}>
                    View
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
              <div className="mt-3">
                <VolumePricing offer={offer} compact />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
