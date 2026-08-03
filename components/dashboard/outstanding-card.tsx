"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { OutstandingPayment } from "@/types/dashboard";
import { ROUTES } from "@/constants";
import { formatInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OutstandingCardProps {
  outstanding: OutstandingPayment;
  className?: string;
}

export function OutstandingCard({
  outstanding,
  className,
}: OutstandingCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className={cn(
        "flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Outstanding
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-red-500 sm:text-[1.65rem]">
        {formatInr(outstanding.amount)}
      </p>
      <p className="mt-1 text-xs text-slate-400">
        {outstanding.invoiceId} ·{" "}
        <span className="font-medium text-red-500/80">
          {outstanding.dueLabel}
        </span>
      </p>
      <Button
        asChild
        className="mt-4 h-10 w-full rounded-xl bg-brand font-semibold hover:bg-brand-700"
      >
        <Link href={ROUTES.payments}>Pay Now</Link>
      </Button>
    </motion.article>
  );
}
