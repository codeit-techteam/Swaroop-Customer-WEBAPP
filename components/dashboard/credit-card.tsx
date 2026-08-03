"use client";

import { motion } from "framer-motion";
import type { CreditSummary } from "@/types/dashboard";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CreditCardProps {
  credit: CreditSummary;
  className?: string;
}

export function CreditCard({ credit, className }: CreditCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-2xl bg-brand p-5 text-white shadow-elevated",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
          Available Credit
        </p>
        <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
          {credit.availablePercent}% free
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight sm:text-[1.65rem]">
        {formatInr(credit.availableCredit)}
      </p>
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-white/75">
          <span>Limit: {formatInr(credit.creditLimit, { compact: true })}</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-white/20"
          role="progressbar"
          aria-valuenow={credit.availablePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${credit.availablePercent}% credit available`}
        >
          <div
            className="h-full rounded-full bg-emerald-400 transition-all"
            style={{ width: `${credit.availablePercent}%` }}
          />
        </div>
      </div>
    </motion.article>
  );
}
