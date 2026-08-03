"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessCardProps {
  title: string;
  description: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SuccessCard({
  title,
  description,
  children,
  footer,
  className,
}: SuccessCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mx-auto flex w-full max-w-md flex-col items-center text-center",
        className,
      )}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted shadow-sm"
        aria-hidden
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </div>
      </motion.div>

      <h1 className="mb-3 text-2xl font-bold tracking-tight text-brand sm:text-[1.75rem]">
        {title}
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        {description}
      </p>

      {children}

      <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        <span>Secure Session Guaranteed</span>
      </div>

      {footer ? <div className="mt-10 w-full">{footer}</div> : null}
    </motion.div>
  );
}
