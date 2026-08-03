"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export function SuccessCard({
  title,
  description,
  children,
  className,
  animated = true,
}: SuccessCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-xl border border-emerald-200 bg-emerald-50 p-4",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold text-emerald-900">{title}</p>
          {description ? (
            <p className="mt-0.5 text-sm text-emerald-800/80">{description}</p>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );

  if (!animated) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {content}
    </motion.div>
  );
}
