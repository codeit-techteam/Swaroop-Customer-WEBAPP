"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getOfferById, recommendedOfferGroupsMock } from "@/mock/offers";
import { OfferCard } from "./offer-card";
import { cn } from "@/lib/utils";

interface RecommendedOffersProps {
  className?: string;
}

export function RecommendedOffers({ className }: RecommendedOffersProps) {
  return (
    <section
      className={cn(
        "space-y-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card md:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/5 text-brand">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            AI Recommended Offers
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Based on previous purchases, browsing history and similar buyers.
          </p>
        </div>
      </div>

      {recommendedOfferGroupsMock.map((group) => {
        const offers = group.offerIds
          .map((id) => getOfferById(id))
          .filter(Boolean);
        if (!offers.length) return null;
        return (
          <div key={group.id}>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {group.title}
                </h3>
                <p className="text-xs text-slate-500">{group.subtitle}</p>
              </div>
              <Link
                href="#offers-grid"
                className="text-xs font-semibold text-brand hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer, index) =>
                offer ? (
                  <OfferCard key={offer.id} offer={offer} index={index} />
                ) : null,
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
