"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
  /** Wider card for registration form */
  size?: "default" | "wide";
}

export function AuthCard({
  children,
  className,
  size = "default",
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "w-full rounded-xl border border-border/60 bg-white p-8 shadow-panel sm:p-10",
        size === "default" && "max-w-[420px]",
        size === "wide" && "max-w-[560px]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
