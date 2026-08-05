"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { offerCampaignsMock } from "@/mock/offers";
import { useOffersStore } from "@/store/offersStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateDdMmYyyy } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PopularCampaignsProps {
  className?: string;
}

export function PopularCampaigns({ className }: PopularCampaignsProps) {
  const applyCampaignType = useOffersStore((s) => s.applyCampaignType);

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
          Seasonal and thematic promotions across the Indian petrochemical
          market.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offerCampaignsMock.map((campaign) => (
          <article
            key={campaign.id}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="relative h-36 overflow-hidden">
              <Image
                src={campaign.image}
                alt={campaign.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-brand/20 to-transparent" />
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
                {campaign.eligibleProducts ? (
                  <div>
                    <dt className="text-slate-400">Eligible</dt>
                    <dd className="font-medium text-slate-700">
                      {campaign.eligibleProducts}
                    </dd>
                  </div>
                ) : null}
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
                  if (campaign.hrefOfferType) {
                    applyCampaignType(campaign.hrefOfferType);
                    document
                      .getElementById("offers-grid")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
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
