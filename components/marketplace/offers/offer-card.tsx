"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ROUTES } from "@/constants";
import type { MarketplaceOffer } from "@/types/offers";
import { OfferBadge } from "./offer-badge";
import { OfferCountdown } from "./offer-countdown";
import { PaymentTypeBadges } from "./payment-type-badges";
import { VolumePricing } from "./volume-pricing";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: MarketplaceOffer;
  index?: number;
  className?: string;
}

export function OfferCard({ offer, index = 0, className }: OfferCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const status = getOfferStatus(offer);
  const purchasable = isOfferPurchasable(offer);
  const detailHref = getOfferDetailHref(offer.id);
  const productHref = `${ROUTES.marketplaceProduct}/${offer.productId}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.3 }}
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-elevated",
        !purchasable && "opacity-90",
        className,
      )}
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-r from-brand to-brand-700">
        {offer.bannerImage ? (
          <Image
            src={offer.bannerImage}
            alt={offer.productName}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-brand/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <OfferBadge offer={offer} variant="discount" />
          <OfferBadge offer={offer} variant="type" />
        </div>
        {status === "ending_soon" ? (
          <div className="absolute bottom-3 left-3">
            <OfferCountdown expiresAt={offer.expiresAt} compact />
          </div>
        ) : null}
        {!purchasable ? (
          <div className="absolute bottom-3 right-3">
            <OfferBadge offer={offer} variant="status" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-4 sm:p-5">
        <div className="flex gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
            {offer.productImage && !imageFailed ? (
              <Image
                src={offer.productImage}
                alt={offer.productName}
                fill
                className="object-cover"
                sizes="56px"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[10px] font-bold text-brand">
                {offer.grade}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verified Partner
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {offer.categoryLabel}
              </span>
            </div>
            <Link href={detailHref} className="block">
              <h3 className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition hover:text-brand">
                {offer.productName}
              </h3>
            </Link>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              Western India Region
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200/80 bg-slate-50/60 py-2.5">
          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Available
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">
              {offer.remainingStock} MT
            </p>
          </div>
          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Minimum order
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-700">
              {formatQuantityMt(offer.moq)}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-brand/[0.035] p-3.5">
          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Offer Price
              </p>
              <p className="text-xl font-bold tabular-nums text-brand">
                {formatInrPerMt(offer.offerPrice)}
              </p>
              <p className="text-xs text-slate-400 line-through">
                {formatInrPerMt(offer.priceBefore)}
              </p>
            </div>
            <p className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Save {formatInr(offer.savings, { compact: true })} / MT
            </p>
          </div>
        </div>

        <VolumePricing offer={offer} compact />

        <div className="flex flex-wrap items-center gap-2">
          {offer.creditEligible ? (
            <OfferBadge offer={offer} variant="credit" className="w-fit" />
          ) : null}
          <PaymentTypeBadges types={offer.paymentTypes} />
        </div>

        <p className="text-xs text-slate-400">
          Valid until {formatDateDdMmYyyy(offer.expiresAt)}
        </p>

        <div className="mt-auto grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2 pt-1">
          <Button
            asChild
            variant="outline"
            className="h-11 min-w-0 rounded-xl px-3 text-sm"
          >
            <Link href={detailHref}>
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-11 min-w-0 rounded-xl bg-brand px-3 text-sm hover:bg-brand-700"
            disabled={!purchasable}
          >
            <Link href={purchasable ? productHref : detailHref}>
              <ShoppingCart className="h-3.5 w-3.5" />
              {purchasable ? "Add to Cart" : getStatusLabel(status)}
            </Link>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
