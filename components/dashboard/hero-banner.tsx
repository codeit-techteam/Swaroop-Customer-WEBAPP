"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { HeroBannerContent } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { generateMarketReportPdf } from "@/lib/market-report-pdf";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/dashboardStore";

interface HeroBannerProps {
  content: HeroBannerContent;
  className?: string;
}

export function HeroBanner({ content, className }: HeroBannerProps) {
  const marketPrices = useDashboardStore((s) => s.marketPrices);
  const marketPricesUpdatedAt = useDashboardStore(
    (s) => s.marketPricesUpdatedAt,
  );

  function handleSecondaryCta() {
    if (content.secondaryCta.action !== "download-market-report") return;

    try {
      generateMarketReportPdf({
        prices: marketPrices,
        updatedAt: marketPricesUpdatedAt,
      });
      toast.success("Market report downloaded");
    } catch {
      toast.error("Unable to generate market report");
    }
  }

  const secondaryIsDownload =
    content.secondaryCta.action === "download-market-report";

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-elevated",
        className,
      )}
      aria-label="Hero banner"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${content.imageUrl})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-brand-900/90 via-brand-800/75 to-brand-700/45"
        aria-hidden="true"
      />
      <div className="relative flex min-h-[180px] flex-col justify-end px-6 py-7 sm:min-h-[210px] sm:px-8 sm:py-8 lg:min-h-[230px] lg:px-10">
        <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.25rem] lg:leading-tight">
          {content.heading}
        </h1>
        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-[15px]">
          {content.subtitle}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="h-10 rounded-xl bg-white px-5 font-semibold text-brand shadow-sm hover:bg-white/95"
          >
            <Link href={content.primaryCta.href}>
              {content.primaryCta.label}
            </Link>
          </Button>
          {secondaryIsDownload ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-white/70 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white"
              onClick={handleSecondaryCta}
            >
              {content.secondaryCta.label}
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-xl border-white/70 bg-transparent px-5 font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={content.secondaryCta.href ?? "#"}>
                {content.secondaryCta.label}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
