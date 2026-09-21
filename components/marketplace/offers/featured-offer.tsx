"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import {
  formatDateDdMmYyyy,
  formatInr,
  formatInrPerMt,
  formatQuantityMt,
} from "@/lib/format";
import {
  getOfferStatus,
  getStatusLabel,
  isOfferPurchasable,
} from "@/lib/offer-utils";
import { getOfferDetailHref } from "@/mock/offers";
import type { MarketplaceOffer } from "@/types/offers";
import { OfferBadge } from "./offer-badge";
import { OfferCountdown } from "./offer-countdown";
import { cn } from "@/lib/utils";

interface FeaturedOfferProps {
  offer: MarketplaceOffer;
  className?: string;
}

export function FeaturedOffer({ offer, className }: FeaturedOfferProps) {
  const purchasable = isOfferPurchasable(offer);
  const status = getOfferStatus(offer);
  const detailHref = getOfferDetailHref(offer.id);
  const productHref = `${ROUTES.marketplaceProduct}/${offer.productId}`;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card",
        className,
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[220px] lg:min-h-[320px] bg-gradient-to-r from-brand to-brand-700">
          {offer.bannerImage ? (
            <Image
              src={offer.bannerImage}
              alt={offer.productName}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-brand/90 via-brand/60 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                Featured Bulk Offer
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">
                {offer.productName}
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Fulfilled by PetroTrade Network
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
                <MapPin className="h-4 w-4" />
                Western India Region
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <OfferBadge offer={offer} variant="discount" />
              {offer.isLimitedTime ? (
                <Badge className="border-0 bg-amber-400/90 text-amber-950">
                  Limited Time
                </Badge>
              ) : null}
              {offer.remainingStock > 0 ? (
                <Badge className="border-0 bg-white/20 text-white">
                  Stock Available
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div className="grid grid-cols-2 gap-4">
            <PriceBlock
              label="Regular Price"
              value={formatInrPerMt(offer.priceBefore)}
              muted
            />
            <PriceBlock
              label="Offer Price"
              value={formatInrPerMt(offer.offerPrice)}
              highlight
            />
            <PriceBlock
              label="You Save"
              value={`${formatInr(offer.savings, { compact: true })} / MT`}
              success
            />
            <PriceBlock
              label="Minimum Quantity"
              value={formatQuantityMt(offer.moq)}
            />
            <PriceBlock
              label="Offer Valid Until"
              value={formatDateDdMmYyyy(offer.expiresAt)}
              className="col-span-2"
            />
          </div>

          {status === "ending_soon" ? (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5">
              <OfferCountdown expiresAt={offer.expiresAt} />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link href={productHref}>View Product</Link>
            </Button>
            <Button
              asChild
              className="h-11 flex-1 rounded-xl bg-brand font-semibold hover:bg-brand-700"
              disabled={!purchasable}
            >
              <Link href={purchasable ? productHref : detailHref}>
                <ShoppingCart className="h-4 w-4" />
                {purchasable ? "Add to Cart" : getStatusLabel(status)}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceBlock({
  label,
  value,
  highlight,
  success,
  muted,
  className,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold tabular-nums",
          highlight && "text-xl text-brand",
          success && "text-emerald-700",
          muted && "text-slate-400 line-through",
          !highlight && !success && !muted && "text-slate-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}
