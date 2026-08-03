"use client";

import Link from "next/link";
import { ArrowRight, Flame, PackageX } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { getOfferDetailHref } from "@/mock/offers";
import type { MarketplaceOffer } from "@/types/offers";
import { OfferCountdownBlocks } from "./offer-countdown";
import { cn } from "@/lib/utils";

interface LimitedTimeOffersProps {
  offers: MarketplaceOffer[];
  className?: string;
}

export function LimitedTimeOffers({
  offers,
  className,
}: LimitedTimeOffersProps) {
  const limited = offers.filter((o) => o.isLimitedTime).slice(0, 6);
  if (!limited.length) return null;

  const lead = limited[0];

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card md:p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-900">
              Limited Time Offers
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Flash deals ending soon — lock rates before inventory clears.
          </p>
        </div>
        <OfferCountdownBlocks expiresAt={lead.expiresAt} />
      </div>

      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {limited.map((offer, index) => (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index }}
            className="min-w-[280px] max-w-[300px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <Badge
                variant={
                  offer.offerType === "flash_sale" ? "destructive" : "warning"
                }
              >
                {offer.offerType === "flash_sale"
                  ? "Flash Sale"
                  : "Deal Ends Soon"}
              </Badge>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                <PackageX className="h-3.5 w-3.5" />
                {offer.remainingStock} MT left
              </span>
            </div>
            <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">
              {offer.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">{offer.productName}</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-lg font-bold tabular-nums text-brand">
                  {formatInr(offer.offerPrice, { compact: true })}
                </p>
                <p className="text-xs text-slate-400">
                  MOQ {formatQuantityMt(offer.moq)}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className="rounded-lg bg-brand hover:bg-brand-700"
              >
                <Link href={getOfferDetailHref(offer.id)}>
                  View
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
