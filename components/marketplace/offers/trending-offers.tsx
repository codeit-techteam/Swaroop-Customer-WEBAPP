"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { formatInrPerMt } from "@/lib/format";
import { getOfferDetailHref } from "@/mock/offers";
import type { MarketplaceOffer } from "@/types/offers";
import { cn } from "@/lib/utils";

interface TrendingOffersProps {
  offers: MarketplaceOffer[];
  className?: string;
}

export function TrendingOffers({ offers, className }: TrendingOffersProps) {
  const trending = offers.filter((o) => o.isTrending).slice(0, 5);

  if (!trending.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card",
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-4 w-4 text-amber-500" />
        <h2 className="text-base font-semibold text-slate-900">
          Trending Offers
        </h2>
      </div>

      <ol className="space-y-1">
        {trending.map((offer, index) => (
          <li key={offer.id}>
            <Link
              href={getOfferDetailHref(offer.id)}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
            >
              <span className="w-6 shrink-0 text-sm font-bold tabular-nums text-slate-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {offer.productName}
                </p>
                <p className="text-xs text-slate-400">
                  {formatInrPerMt(offer.offerPrice)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {offer.discountPercent}% OFF
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
