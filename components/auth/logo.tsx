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

export function Logo({
  variant = "light",
  showTagline = false,
  tagline = "INDUSTRIAL PORTAL",
  href,
  className,
  size = "md",
}: LogoProps) {
  const isLight = variant === "light";
  const iconSize = size === "sm" ? 32 : 36;

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/brand/polystorex-logo.png"
        alt={APP_SHORT_NAME}
        width={iconSize}
        height={iconSize}
        className="shrink-0 object-contain"
        priority
      />
      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-semibold tracking-tight",
            size === "sm" ? "text-sm" : "text-base",
            isLight ? "text-white" : "text-brand",
          )}
        >
          {APP_SHORT_NAME}
          {showTagline ? "" : " Portal"}
        </span>
        {showTagline ? (
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.12em]",
              isLight ? "text-white/70" : "text-muted-foreground",
            )}
          >
            {tagline}
          </span>
        ) : null}
      </div>
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
