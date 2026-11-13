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
  /** `full` = official lockup; `mark` = orbital symbol only. */
  lockup?: "full" | "mark";
}

const HEIGHT = {
  sm: "h-11",
  md: "h-14",
  lg: "h-[4.5rem]",
} as const;

/**
 * Official PolyStoreX artwork.
 * `variant="light"` sits on dark surfaces (transparent lockup).
 * `variant="dark"` sits on light surfaces (black plate so the white wordmark remains visible).
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
  const onDarkSurface = variant === "light";
  const height = HEIGHT[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {lockup === "mark" ? (
        <Image
          src="/brand/polystorex-symbol.png"
          alt={APP_SHORT_NAME}
          width={216}
          height={169}
          priority
          className={cn("w-auto object-contain", height)}
        />
      ) : (
        <Image
          src={
            onDarkSurface
              ? "/brand/polystorex-logo-transparent.png"
              : "/brand/polystorex-logo-light-bg.png"
          }
          alt={APP_SHORT_NAME}
          width={onDarkSurface ? 848 : 928}
          height={onDarkSurface ? 372 : 436}
          priority
          className={cn("w-auto max-w-full self-start object-contain", height)}
        />
      )}
      {showTagline && lockup === "full" ? (
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.16em]",
            onDarkSurface ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {tagline}
        </span>
      ) : null}
    </span>
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
