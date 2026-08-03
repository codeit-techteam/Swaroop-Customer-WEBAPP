"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProgressStage {
  id: string;
  label: string;
}

interface OrderProgressTrackProps {
  stages: readonly ProgressStage[];
  currentIndex: number;
  /** Compact for table cells; default for cards. */
  size?: "sm" | "md";
  className?: string;
  showCurrentLabel?: boolean;
  currentLabel?: string;
}

export function OrderProgressTrack({
  stages,
  currentIndex,
  size = "md",
  className,
  showCurrentLabel = true,
  currentLabel,
}: OrderProgressTrackProps) {
  const safeIndex = Math.max(0, Math.min(stages.length - 1, currentIndex));
  const label = currentLabel ?? stages[safeIndex]?.label ?? "";
  const isSm = size === "sm";

  return (
    <div className={cn("min-w-0", className)}>
      {showCurrentLabel ? (
        <p
          className={cn(
            "mb-1.5 font-semibold text-slate-800",
            isSm ? "text-[11px]" : "text-xs",
          )}
        >
          {label}
          <span className="ml-1 font-normal text-slate-500">
            · Step {safeIndex + 1}/{stages.length}
          </span>
        </p>
      ) : null}

      <div className="flex items-center gap-0">
        {stages.map((stage, index) => {
          const done = index < safeIndex;
          const current = index === safeIndex;
          const pending = index > safeIndex;

          return (
            <div key={stage.id} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full font-semibold",
                    isSm ? "h-5 w-5 text-[9px]" : "h-7 w-7 text-[10px]",
                    done && "bg-brand text-white",
                    current &&
                      "bg-brand text-white ring-2 ring-brand/25 ring-offset-1",
                    pending &&
                      "border border-slate-200 bg-white text-slate-400",
                  )}
                  title={stage.label}
                >
                  {done ? (
                    <Check className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "w-full truncate text-center font-medium leading-tight",
                    isSm ? "text-[9px]" : "text-[10px]",
                    current ? "text-brand" : "text-slate-500",
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 ? (
                <div
                  className={cn(
                    "mb-4 h-0.5 min-w-[6px] flex-1 rounded-full",
                    isSm ? "mb-3" : "mb-4",
                    index < safeIndex ? "bg-brand" : "bg-slate-200",
                  )}
                  aria-hidden
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
