"use client";

import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ValidationTimelineStep } from "@/types/purchase-request";

interface ApprovalTimelineProps {
  steps: ValidationTimelineStep[];
  className?: string;
}

export function ApprovalTimeline({ steps, className }: ApprovalTimelineProps) {
  return (
    <Card className={cn("border-slate-200", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Approval Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                {!isLast ? (
                  <span
                    className={cn(
                      "absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-0.5",
                      step.status === "completed"
                        ? "bg-emerald-400"
                        : "bg-slate-200",
                    )}
                    aria-hidden
                  />
                ) : null}
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    step.status === "completed" && "bg-emerald-500 text-white",
                    step.status === "current" &&
                      "bg-accent-blue text-white ring-4 ring-accent-blue/20",
                    step.status === "pending" && "bg-slate-100 text-slate-400",
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-2.5 w-2.5 fill-current" />
                  )}
                </motion.span>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      step.status === "pending"
                        ? "text-slate-400"
                        : "text-slate-900",
                    )}
                  >
                    {step.title}
                  </p>
                  {step.subtitle ? (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {step.subtitle}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
