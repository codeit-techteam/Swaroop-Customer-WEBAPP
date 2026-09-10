"use client";

import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BlindSellerBadgeProps {
  className?: string;
  compact?: boolean;
}

export function BlindSellerBadge({
  className,
  compact = false,
}: BlindSellerBadgeProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-600",
              className,
            )}
          >
            <Lock className="h-3 w-3 shrink-0" aria-hidden />
            {compact ? "Blind" : "Seller Identity Protected"}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs leading-relaxed">
          Supplier identity remains confidential during marketplace discovery
          and procurement. Disclosure follows PetroTrade transaction policy.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
