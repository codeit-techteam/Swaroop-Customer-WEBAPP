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
  size?: "sm" | "md";
}

/**
 * Production brand lockup: orbit mark + PolyStoreX wordmark (transparent asset).
 * Avoids the old square "P" tile and black plate behind the logo.
 */
export function Logo({
  variant = "light",
  showTagline = false,
  tagline = "INDUSTRIAL PORTAL",
  href,
  className,
  size = "md",
}: LogoProps) {
  const isLight = variant === "light";
  const height = size === "sm" ? 36 : 44;

  const content = (
    <div className={cn("flex flex-col", className)}>
      <Image
        src="/brand/polystorex-logo.png"
        alt={APP_SHORT_NAME}
        width={size === "sm" ? 160 : 200}
        height={height}
        className={cn(
          "w-auto object-contain object-left",
          size === "sm" ? "h-9" : "h-11",
        )}
        priority
      />
      {showTagline ? (
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.14em]",
            isLight ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {tagline}
        </span>
      ) : null}
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
