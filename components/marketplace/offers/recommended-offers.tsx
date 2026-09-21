"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useOffersStore } from "@/store/offersStore";
import { OfferCard } from "./offer-card";
import { cn } from "@/lib/utils";

interface RecommendedOffersProps {
  className?: string;
}

export function RecommendedOffers({ className }: RecommendedOffersProps) {
  const offers = useOffersStore((state) => state.offers);
  const groups = [
    {
      id: "available",
      title: "Available now",
      subtitle: "Live marketplace offers from PostgreSQL",
      items: offers.slice(0, 4),
    },
    {
      id: "more",
      title: "More grades",
      subtitle: "Additional customer-visible listings",
      items: offers.slice(4, 8),
    },
  ].filter((group) => group.items.length > 0);

  if (!groups.length) return null;

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
            Recommended Offers
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Live offers from the same catalog used across Customer App and Web.
          </p>
        </div>
      </div>

      {groups.map((group) => (
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {group.items.map((offer, index) => (
              <OfferCard key={offer.id} offer={offer} index={index} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
