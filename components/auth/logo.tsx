"use client";

import Link from "next/link";
import { Factory } from "lucide-react";
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
  tagline = "INDUSTRIAL PORTAL V2.4",
  href,
  className,
  size = "md",
}: LogoProps) {
  const isLight = variant === "light";
  const iconSize = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const factorySize = size === "sm" ? "h-4 w-4" : "h-4.5 w-4.5";

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md",
          iconSize,
          isLight ? "bg-white text-brand" : "bg-brand text-white",
        )}
        aria-hidden
      >
        <Factory
          className={cn(factorySize, "h-[18px] w-[18px]")}
          strokeWidth={2}
        />
      </div>
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
