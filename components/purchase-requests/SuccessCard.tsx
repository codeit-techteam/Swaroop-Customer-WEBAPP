"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ORDER_CONFIRMATION_COPY } from "@/mock/purchase-request";

interface SuccessCardProps {
  title?: string;
  subtitle?: string;
  requestId?: string;
  chip?: string;
  className?: string;
  children?: ReactNode;
}

export function SuccessCard({
  title = ORDER_CONFIRMATION_COPY.submittedTitle,
  subtitle = "Seller has 15 minutes to approve your purchase request.",
  requestId,
  chip = ORDER_CONFIRMATION_COPY.submittedChip,
  className,
  children,
}: SuccessCardProps) {
  return (
    <Card className={cn("overflow-hidden border-slate-200", className)}>
      <CardContent className="flex flex-col items-center px-6 py-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden />
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="mt-5 space-y-2"
        >
          <Badge variant="success" className="uppercase tracking-wide">
            {chip}
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {requestId ? (
            <p className="font-mono text-lg font-semibold text-brand">
              {requestId}
            </p>
          ) : null}
          <p className="mx-auto max-w-md text-sm text-slate-500">{subtitle}</p>
        </motion.div>

        {children ? <div className="mt-6 w-full">{children}</div> : null}
      </CardContent>
    </Card>
  );
}
