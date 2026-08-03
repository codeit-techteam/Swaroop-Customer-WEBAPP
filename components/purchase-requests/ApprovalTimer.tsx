"use client";

import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ORDER_CONFIRMATION_COPY,
  PRICE_LOCK_DURATION_SECONDS,
} from "@/mock/purchase-request";
import type { PriceLockStatus } from "@/types/purchase-request";

interface ApprovalTimerProps {
  secondsRemaining: number;
  status: PriceLockStatus;
  className?: string;
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function ApprovalTimer({
  secondsRemaining,
  status,
  className,
}: ApprovalTimerProps) {
  const expired = status === "expired" || secondsRemaining <= 0;
  const progress =
    ((PRICE_LOCK_DURATION_SECONDS - secondsRemaining) /
      PRICE_LOCK_DURATION_SECONDS) *
    100;

  return (
    <Card
      className={cn(
        "border-slate-200",
        expired ? "border-amber-300 bg-amber-50/60" : "bg-brand/[0.03]",
        className,
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
              <Timer className="h-3.5 w-3.5" aria-hidden />
              {ORDER_CONFIRMATION_COPY.priceLockHeading}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {ORDER_CONFIRMATION_COPY.priceLockSubtitle}
            </p>
          </div>
          <motion.p
            key={secondsRemaining}
            initial={{ opacity: 0.5, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "font-mono text-3xl font-semibold tabular-nums",
              expired ? "text-amber-700" : "text-brand",
            )}
          >
            {expired
              ? ORDER_CONFIRMATION_COPY.priceLockExpired
              : formatTime(secondsRemaining)}
          </motion.p>
        </div>
        <Progress
          value={Math.min(100, Math.max(0, progress))}
          className="h-2"
        />
        <div className="rounded-xl bg-white/80 px-3 py-2 text-xs text-slate-600">
          <p className="font-medium text-slate-800">
            {ORDER_CONFIRMATION_COPY.statusMessage}
          </p>
          <p className="mt-0.5 text-slate-500">
            {ORDER_CONFIRMATION_COPY.statusExpected}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
