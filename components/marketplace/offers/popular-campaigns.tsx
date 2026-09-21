"use client";

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useOffersStore } from "@/store/offersStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateDdMmYyyy } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OfferType } from "@/types/offers";

interface PopularCampaignsProps {
  className?: string;
}

export function PopularCampaigns({ className }: PopularCampaignsProps) {
  const offers = useOffersStore((state) => state.offers);
  const applyCampaignType = useOffersStore((s) => s.applyCampaignType);

  const campaigns = useMemo(() => {
    const byType = new Map<OfferType, typeof offers>();
    for (const offer of offers) {
      const list = byType.get(offer.offerType) ?? [];
      list.push(offer);
      byType.set(offer.offerType, list);
    }
    return [...byType.entries()].map(([offerType, items]) => ({
      id: offerType,
      title: items[0]?.categoryLabel ?? offerType,
      description: `${items.length} live offer${items.length === 1 ? "" : "s"} in this campaign type.`,
      badge: items[0]?.badge ?? "Live",
      offerCount: items.length,
      maxDiscountPercent: Math.max(...items.map((item) => item.discountPercent), 0),
      expiresAt: items[0]?.expiresAt,
      hrefOfferType: offerType,
    }));
  }, [offers]);

  if (!campaigns.length) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card md:p-6",
        className,
      )}
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Popular Campaigns
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Campaign groups generated from live marketplace offers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <article
            key={campaign.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="relative h-24 overflow-hidden bg-gradient-to-r from-brand to-brand-700">
              <Badge className="absolute left-3 top-3 border-0 bg-white/95 text-brand">
                {campaign.badge}
              </Badge>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-base font-semibold text-slate-900">
                {campaign.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-500">
                {campaign.description}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {campaign.maxDiscountPercent ? (
                  <div>
                    <dt className="text-slate-400">Max discount</dt>
                    <dd className="font-semibold text-emerald-700">
                      Up to {campaign.maxDiscountPercent}%
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-slate-400">Eligible</dt>
                  <dd className="font-medium text-slate-700">
                    {campaign.offerCount} offers
                  </dd>
                </div>
                {campaign.expiresAt ? (
                  <div className="col-span-2">
                    <dt className="text-slate-400">Expires</dt>
                    <dd className="font-medium text-slate-700">
                      {formatDateDdMmYyyy(campaign.expiresAt)}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-10 w-full rounded-xl"
                onClick={() => {
                  applyCampaignType(campaign.hrefOfferType);
                  document
                    .getElementById("offers-grid")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Explore Offers
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
