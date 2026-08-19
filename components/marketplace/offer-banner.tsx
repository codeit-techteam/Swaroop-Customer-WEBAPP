"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { formatInr, formatDateDdMmYyyy } from "@/lib/format";
import { isOfferPurchasable } from "@/lib/offer-utils";
import { offersMock } from "@/mock/offers";
import type { MarketplaceOffer } from "@/types/offers";
import { OfferBadge } from "./offers/offer-badge";
import { cn } from "@/lib/utils";

const MAX_TODAYS_OFFERS = 4;

function getEndsInLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days <= 1) return "Ends today";
  if (days === 2) return "Ends in 2 Days";
  return `Ends in ${days} Days`;
}

function getOfferHighlight(offer: MarketplaceOffer): string {
  if (offer.offerType === "bulk_discount" && offer.moq >= 50) {
    return `Free Freight · Above ${offer.moq} MT`;
  }
  if (offer.savings >= 20000) {
    return `Save ${formatInr(offer.savings, { compact: true })} / MT`;
  }
  return offer.description;
}

/** Active offers shown on the unified Marketplace home. */
export function getTodaysOffers(
  limit = MAX_TODAYS_OFFERS,
): MarketplaceOffer[] {
  const active = offersMock.filter(isOfferPurchasable);
  const prioritized = [...active].sort((a, b) => {
    if (a.isLimitedTime !== b.isLimitedTime) {
      return a.isLimitedTime ? -1 : 1;
    }
    return (
      new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    );
  });
  return prioritized.slice(0, limit);
}

interface MarketplaceOfferCardProps {
  offer: MarketplaceOffer;
  index?: number;
  selected?: boolean;
  onViewProducts: (offer: MarketplaceOffer) => void;
  className?: string;
}

export function MarketplaceOfferCard({
  offer,
  index = 0,
  selected = false,
  onViewProducts,
  className,
}: MarketplaceOfferCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.2), duration: 0.28 }}
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-2xl border bg-white p-4 shadow-card transition-all duration-300 sm:w-auto",
        selected
          ? "border-brand ring-2 ring-brand/20"
          : "border-slate-200/90 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-elevated",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <OfferBadge offer={offer} variant="discount" />
        {offer.isLimitedTime ? (
          <OfferBadge offer={offer} variant="type" />
        ) : null}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-slate-900">
        {offer.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
        {getOfferHighlight(offer)}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-400">
        <span className="font-medium text-amber-700">
          {getEndsInLabel(offer.expiresAt)}
        </span>
        <span>Until {formatDateDdMmYyyy(offer.expiresAt)}</span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-4 h-10 w-full rounded-xl text-sm font-medium"
        onClick={() => onViewProducts(offer)}
      >
        View Products
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </motion.article>
  );
}

interface OfferBannerProps {
  offers?: MarketplaceOffer[];
  activeOfferId?: string | null;
  onViewProducts: (offer: MarketplaceOffer) => void;
  className?: string;
}

export function OfferBanner({
  offers,
  activeOfferId = null,
  onViewProducts,
  className,
}: OfferBannerProps) {
  const items = offers ?? getTodaysOffers();
  if (items.length === 0) return null;

  return (
    <section className={cn("space-y-3", className)}>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Today&apos;s Offers
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Limited-time promotions available through PetroTrade.
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-4 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
        {items.map((offer, index) => (
          <MarketplaceOfferCard
            key={offer.id}
            offer={offer}
            index={index}
            selected={activeOfferId === offer.id}
            onViewProducts={onViewProducts}
          />
        ))}
      </div>
    </section>
  );
}
