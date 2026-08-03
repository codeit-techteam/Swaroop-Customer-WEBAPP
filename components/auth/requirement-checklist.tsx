"use client";

import { Check, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RequirementItem {
  id: string;
  label: string;
  met: boolean;
}

interface RequirementChecklistProps {
  title?: string;
  items: RequirementItem[];
  className?: string;
}

export function RequirementChecklist({
  title = "Security Requirements",
  items,
  className,
}: RequirementChecklistProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-muted/40 px-4 py-3.5",
        className,
      )}
      role="list"
      aria-label={title}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            role="listitem"
            className="flex items-center gap-2.5 text-sm"
          >
            <span
              className={cn(
                "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                item.met
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-muted-foreground/40 bg-transparent text-transparent",
              )}
              aria-hidden
            >
              <AnimatePresence mode="wait" initial={false}>
                {item.met ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <Circle className="h-2 w-2 text-transparent" />
                )}
              </AnimatePresence>
            </span>
            <span
              className={cn(
                "transition-colors",
                item.met
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
              <span className="sr-only">
                {item.met ? " — met" : " — not met"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
