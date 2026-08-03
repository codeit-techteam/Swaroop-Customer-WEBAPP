"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SecurityInfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  variant?: "glass" | "solid";
}

export function SecurityInfoCard({
  icon: Icon,
  title,
  description,
  className,
  variant = "glass",
}: SecurityInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={cn(
        "rounded-xl p-4 backdrop-blur-sm",
        variant === "glass" && "bg-white/15 ring-1 ring-white/20",
        variant === "solid" && "bg-white shadow-card",
        className,
      )}
    >
      <div className="mb-2.5 flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-white">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-white/75">{description}</p>
    </motion.div>
  );
}
