"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FilePlus2,
  GitCompareArrows,
  Heart,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { getOfferDetailHref, getOfferQuoteHref } from "@/mock/offers";
import { useOffersStore } from "@/store/offersStore";
import type { MarketplaceOffer } from "@/types/offers";
import { PaymentTypeBadges } from "./payment-type-badges";
import { OfferCountdown } from "./offer-countdown";
import { cn } from "@/lib/utils";

interface OfferCardProps {
  offer: MarketplaceOffer;
  index?: number;
  className?: string;
}

export function OfferCard({ offer, index = 0, className }: OfferCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const wishlistIds = useOffersStore((s) => s.wishlistIds);
  const compareIds = useOffersStore((s) => s.compareIds);
  const toggleWishlist = useOffersStore((s) => s.toggleWishlist);
  const toggleCompare = useOffersStore((s) => s.toggleCompare);

  const wished = wishlistIds.includes(offer.id);
  const compared = compareIds.includes(offer.id);
  const detailHref = getOfferDetailHref(offer.id);
  const quoteHref = getOfferQuoteHref(offer);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.3 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated",
        className,
      )}
    >
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <Image
          src={offer.bannerImage}
          alt={offer.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand/70 via-transparent to-transparent" />
        <Badge className="absolute left-3 top-3 border-0 bg-accent-blue text-white hover:bg-accent-blue">
          {offer.badge}
        </Badge>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold text-white">
            {offer.title}
          </p>
          <OfferCountdown expiresAt={offer.expiresAt} compact />
        </div>
      </div>

      <div className="relative mx-4 -mt-8 h-20 w-20 overflow-hidden rounded-xl border-2 border-white bg-slate-100 shadow-card">
        {!imageFailed ? (
          <Image
            src={offer.productImage}
            alt={offer.productName}
            fill
            className="object-cover"
            sizes="80px"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand/5 text-xs font-bold text-brand">
            {offer.grade}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {offer.brandShortName}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {offer.categoryLabel}
            </span>
          </div>
          <Link href={detailHref}>
            <h3 className="mt-1.5 text-base font-semibold text-slate-900 transition hover:text-brand">
              {offer.productName}
            </h3>
          </Link>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            {offer.warehouseLabel}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Offer Price / MT
              </p>
              <p className="text-xl font-bold tabular-nums text-brand">
                {formatInr(offer.offerPrice, { compact: true })}
              </p>
              <p className="text-xs text-slate-400 line-through">
                {formatInr(offer.priceBefore, { compact: true })}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="success" className="font-bold">
                −{offer.discountPercent}%
              </Badge>
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                Save {formatInr(offer.savings, { compact: true })}
              </p>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-200/80 pt-2 text-xs text-slate-500">
            <span>MOQ {formatQuantityMt(offer.moq)}</span>
            <span>{offer.remainingStock} MT left</span>
          </div>
        </div>

        <PaymentTypeBadges types={offer.paymentTypes} />

        <div className="mt-auto grid grid-cols-2 gap-2 pt-1">
          <Button asChild variant="outline" className="h-10 rounded-xl text-sm">
            <Link href={detailHref}>
              View Offer
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl bg-brand text-sm hover:bg-brand-700"
          >
            <Link href={quoteHref}>
              <FilePlus2 className="h-3.5 w-3.5" />
              Request Quote
            </Link>
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-9 flex-1 rounded-xl text-xs",
              wished &&
                "bg-rose-50 text-rose-600 hover:bg-rose-50 hover:text-rose-700",
            )}
            onClick={() => {
              toggleWishlist(offer.id);
              toast.success(
                wished ? "Removed from wishlist" : "Saved to wishlist",
              );
            }}
          >
            <Heart className={cn("h-3.5 w-3.5", wished && "fill-current")} />
            Wishlist
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-9 flex-1 rounded-xl text-xs",
              compared && "bg-sky-50 text-sky-700 hover:bg-sky-50",
            )}
            onClick={() => {
              toggleCompare(offer.id);
              toast.message(
                compared ? "Removed from compare" : "Added to compare (max 3)",
              );
            }}
          >
            <GitCompareArrows className="h-3.5 w-3.5" />
            Compare
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
