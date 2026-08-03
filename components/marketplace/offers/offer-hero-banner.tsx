"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FilePlus2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OfferCountdown } from "./offer-countdown";
import {
  getOfferDetailHref,
  getOfferQuoteHref,
  offerHeroBannersMock,
  getOfferById,
} from "@/mock/offers";
import { cn } from "@/lib/utils";

interface OfferHeroBannerProps {
  className?: string;
}

export function OfferHeroBannerSlider({ className }: OfferHeroBannerProps) {
  const banners = offerHeroBannersMock;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [banners.length]);

  const banner = banners[index];
  const offer = getOfferById(banner.offerId);

  const goPrev = () =>
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
  const goNext = () => setIndex((prev) => (prev + 1) % banners.length);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-elevated",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0.4, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="relative min-h-[280px] md:min-h-[320px]"
        >
          <Image
            src={banner.backgroundImage}
            alt={banner.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1400px) 100vw, 1100px"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B2E59]/95 via-[#0B2E59]/75 to-[#0B2E59]/35" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-6 md:p-8 lg:p-10">
            <div className="max-w-2xl space-y-4">
              <Badge className="border-0 bg-accent-blue px-3 py-1 text-xs font-semibold text-white hover:bg-accent-blue">
                {banner.discountBadge}
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                {banner.title}
              </h2>
              <p className="max-w-xl text-sm text-white/80 md:text-base">
                {banner.description}
              </p>
              <OfferCountdown expiresAt={banner.expiresAt} />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="h-11 rounded-xl bg-white px-5 font-semibold text-brand hover:bg-slate-100"
              >
                <Link href={getOfferDetailHref(banner.offerId)}>
                  {banner.ctaPrimary}
                </Link>
              </Button>
              {offer ? (
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-xl border-white/40 bg-white/10 px-5 font-semibold text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href={getOfferQuoteHref(offer)}>
                    <FilePlus2 className="h-4 w-4" />
                    {banner.ctaSecondary}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous banner"
          onClick={goPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next banner"
          onClick={goNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-5 left-6 z-20 flex gap-1.5 md:left-8">
        {banners.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Go to banner ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index
                ? "w-8 bg-white"
                : "w-3 bg-white/40 hover:bg-white/60",
            )}
          />
        ))}
      </div>
    </div>
  );
}
