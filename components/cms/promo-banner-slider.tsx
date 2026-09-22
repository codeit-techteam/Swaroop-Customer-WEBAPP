"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCmsBanners } from "@/hooks/use-cms-banners";
import {
  cmsBannerHref,
  cmsBannerImage,
  cmsBannerIsExternal,
} from "@/lib/cms-banner";
import { trackCmsBannerEvent } from "@/services/cms";
import type { CmsBanner, CmsBannerPlacement } from "@/types/cms-banner";
import { cn } from "@/lib/utils";

const AUTO_MS = 6000;

interface PromoBannerSliderProps {
  placement: CmsBannerPlacement;
  fallback?: ReactNode;
  compact?: boolean;
  className?: string;
}

export function PromoBannerSlider({
  placement,
  fallback = null,
  compact = false,
  className,
}: PromoBannerSliderProps) {
  const { banners, isLoading } = useCmsBanners(placement);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const banner = banners[Math.min(index, Math.max(banners.length - 1, 0))];

  useEffect(() => {
    if (!banner?.id) return;
    trackCmsBannerEvent(banner.id, "IMPRESSION");
  }, [banner?.id]);

  if (isLoading && !banners.length) {
    return fallback ? <>{fallback}</> : null;
  }
  if (!banner) return fallback ? <>{fallback}</> : null;

  const href = cmsBannerHref(banner);
  const image = cmsBannerImage(banner);
  const external = cmsBannerIsExternal(href);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200/90 bg-brand shadow-elevated",
        className,
      )}
      aria-label="Promotional banners"
    >
      <AnimatePresence mode="wait">
        <PromoSlide
          key={banner.id}
          banner={banner}
          href={href}
          image={image}
          external={external}
          compact={compact}
        />
      </AnimatePresence>

      {banners.length > 1 ? (
        <>
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() =>
                setIndex((prev) => (prev - 1 + banners.length) % banners.length)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() => setIndex((prev) => (prev + 1) % banners.length)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <ChevronRight className="h-4 w-4" />
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
                  i === index ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function PromoSlide({
  banner,
  href,
  image,
  external,
  compact,
}: {
  banner: CmsBanner;
  href: string | null;
  image: string;
  external: boolean;
  compact: boolean;
}) {
  const cta = banner.ctaText || "View";

  function handleClick() {
    trackCmsBannerEvent(banner.id, "CLICK");
  }

  return (
    <motion.article
      initial={{ opacity: 0.45, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden",
        compact ? "min-h-[180px] md:min-h-[200px]" : "min-h-[220px] md:min-h-[260px]",
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(30,111,255,0.45), transparent 42%), linear-gradient(135deg, #0B2E59 0%, #123A6B 45%, #0F2A4A 100%)",
          }}
        />
      )}
      <div className="absolute inset-0 bg-brand/55" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-brand/85 to-transparent" />

      <div
        className={cn(
          "relative z-10 flex h-full flex-col justify-between gap-5 p-6 md:p-8",
          compact ? "lg:flex-row lg:items-end" : "lg:min-h-[260px] lg:flex-row lg:items-end lg:justify-between",
        )}
      >
        <div className="max-w-2xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            {banner.badge || "CAMPAIGN"}
          </p>
          <h2 className={cn("font-bold tracking-tight text-white", compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl")}>
            {banner.title}
          </h2>
          {banner.subtitle ? (
            <p className="mt-1 text-sm font-medium text-white/90 md:text-base">
              {banner.subtitle}
            </p>
          ) : null}
          {banner.description ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
              {banner.description}
            </p>
          ) : null}
        </div>
        {href ? (
          <Button
            asChild
            className="h-10 shrink-0 rounded-xl bg-white px-4 text-sm font-semibold text-brand hover:bg-slate-100"
          >
            {external ? (
              <a href={href} target="_blank" rel="noreferrer" onClick={handleClick}>
                {cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <Link href={href} onClick={handleClick}>
                {cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </Button>
        ) : null}
      </div>
    </motion.article>
  );
}
