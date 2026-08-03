"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContinueButtonProps {
  label: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  showArrow?: boolean;
  className?: string;
}

export function ContinueButton({
  label,
  type = "submit",
  disabled = false,
  onClick,
  showArrow = false,
  className,
}: ContinueButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.99 }}
    >
      <Button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "h-11 rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800",
          className,
        )}
        aria-label={label}
      >
        {label}
        {showArrow ? (
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        ) : null}
      </Button>
    </motion.div>
  );
}
