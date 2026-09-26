"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HeroBannerContent } from "@/types/dashboard";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  content: HeroBannerContent;
  className?: string;
}

/**
 * Local fallback when CMS has no ACTIVE HOME_HERO banner.
 * Production copy/CTAs should be managed via Admin → Content → Banners (NAVY_GRID).
 */
export function HeroBanner({ content, className }: HeroBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-200 bg-brand shadow-elevated",
        className,
      )}
      aria-label="Hero banner"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, rgba(30,111,255,0.45), transparent 42%), radial-gradient(circle at 88% 10%, rgba(255,255,255,0.12), transparent 35%), linear-gradient(135deg, #0B2E59 0%, #123A6B 45%, #0F2A4A 100%)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative flex min-h-[200px] flex-col justify-end gap-4 px-6 py-7 sm:min-h-[220px] sm:px-8 sm:py-8 lg:min-h-[240px] lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-2xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
            Blind B2B Marketplace
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2.25rem] lg:leading-tight">
            {content.heading || "Source Petrochemicals with Confidence"}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-white/85 sm:text-[15px]">
            {content.subtitle ||
              "Discover verified grades, compare market prices and procure through a secure blind marketplace."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button
            asChild
            className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-brand hover:bg-slate-100"
          >
            <Link href={ROUTES.marketplace}>
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl border-white/30 bg-transparent px-4 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Link href={ROUTES.purchaseRequestsCreate}>
              Create Purchase Request
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
