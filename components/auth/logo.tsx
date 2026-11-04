"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_SHORT_NAME } from "@/constants";

interface LogoProps {
  variant?: "light" | "dark";
  showTagline?: boolean;
  tagline?: string;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** `full` = orbit mark + wordmark; `mark` = orbit symbol only. */
  lockup?: "full" | "mark";
}

const SIZE = {
  sm: { mark: 32, word: "text-[1.05rem]", gap: "gap-2" },
  md: { mark: 40, word: "text-[1.25rem]", gap: "gap-2.5" },
  lg: { mark: 48, word: "text-[1.45rem]", gap: "gap-3" },
} as const;

/**
 * Production brand lockup: transparent orbit mark + CSS wordmark.
 * Works on light and dark surfaces (avoids baked-in white text / black plates).
 */
export function Logo({
  variant = "light",
  showTagline = false,
  tagline = "INDUSTRIAL PORTAL",
  href,
  className,
  size = "md",
  lockup = "full",
}: LogoProps) {
  const isLight = variant === "light";
  const dims = SIZE[size];

  const content = (
    <div className={cn("inline-flex flex-col", className)}>
      <span
        className={cn("inline-flex items-center", dims.gap)}
        aria-label={APP_SHORT_NAME}
      >
        <span
          className={cn(
            "relative shrink-0 overflow-hidden rounded-full",
            "shadow-[0_6px_16px_rgba(11,46,89,0.18)] ring-1",
            isLight ? "bg-black/25 ring-white/25" : "bg-white ring-brand/10",
          )}
          style={{ width: dims.mark, height: dims.mark }}
        >
          <Image
            src="/brand/polystorex-mark.png"
            alt=""
            width={dims.mark}
            height={dims.mark}
            className="h-full w-full object-contain"
            aria-hidden
            priority
          />
        </span>

        {lockup === "full" ? (
          <span className="inline-flex flex-col justify-center">
            <span
              className={cn(
                "font-semibold leading-none tracking-[0.02em]",
                dims.word,
                isLight ? "text-white" : "text-brand",
              )}
            >
              PolyStore
              <span
                className={cn(
                  "bg-gradient-to-br bg-clip-text text-transparent",
                  isLight
                    ? "from-[#4DA3FF] via-[#1E6FFF] to-[#E8B923]"
                    : "from-[#1E6FFF] via-[#1558CC] to-[#C8960C]",
                )}
              >
                X
              </span>
            </span>
            {showTagline ? (
              <span
                className={cn(
                  "mt-1 text-[10px] font-medium uppercase tracking-[0.16em]",
                  isLight ? "text-white/70" : "text-muted-foreground",
                )}
              >
                {tagline}
              </span>
            ) : null}
          </span>
        ) : null}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}
