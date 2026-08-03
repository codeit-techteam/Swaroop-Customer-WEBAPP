"use client";

import { Clock3, Layers3, Percent, Sparkles, WalletCards } from "lucide-react";
import { motion } from "framer-motion";
import type { OfferSummaryStats } from "@/types/offers";
import { cn } from "@/lib/utils";

interface OfferSummaryCardsProps {
  stats: OfferSummaryStats;
  className?: string;
}

const CARDS = [
  {
    key: "activeOffers" as const,
    label: "Active Offers",
    icon: Sparkles,
    accent: "from-brand to-brand-700",
  },
  {
    key: "limitedTimeDeals" as const,
    label: "Limited Time Deals",
    icon: Clock3,
    accent: "from-sky-600 to-brand",
  },
  {
    key: "bulkDiscountCampaigns" as const,
    label: "Bulk Discount Campaigns",
    icon: Layers3,
    accent: "from-indigo-600 to-brand",
  },
  {
    key: "creditEligibleOffers" as const,
    label: "Credit Eligible Offers",
    icon: WalletCards,
    accent: "from-blue-700 to-sky-600",
  },
];

export function OfferSummaryCards({
  stats,
  className,
}: OfferSummaryCardsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4",
        className,
      )}
    >
      {CARDS.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card"
          >
            <div className={cn("h-1.5 bg-gradient-to-r", card.accent)} />
            <div className="flex items-start justify-between gap-3 p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-brand">
                  {stats[card.key]}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/5 text-brand">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500">
              <Percent className="h-3.5 w-3.5 text-accent-blue" />
              Live marketplace inventory
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
