"use client";

import Image from "next/image";
import { offerCampaignsMock } from "@/mock/offers";
import { useOffersStore } from "@/store/offersStore";
import { Badge } from "@/components/ui/badge";
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {offerCampaignsMock.map((campaign) => (
          <button
            key={campaign.id}
            type="button"
            onClick={() => {
              if (campaign.hrefOfferType) {
                applyCampaignType(campaign.hrefOfferType);
                document
                  .getElementById("offers-grid")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="group overflow-hidden rounded-2xl border border-slate-200 text-left transition hover:-translate-y-0.5 hover:shadow-elevated"
          >
            <div className="relative h-28 overflow-hidden">
              <Image
                src={campaign.image}
                alt={campaign.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="220px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/80 to-transparent" />
              <Badge className="absolute left-2 top-2 border-0 bg-white/90 text-brand hover:bg-white/90">
                {campaign.badge}
              </Badge>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {campaign.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                {campaign.description}
              </p>
              <p className="mt-2 text-[11px] font-semibold text-brand">
                {campaign.offerCount} offers
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
