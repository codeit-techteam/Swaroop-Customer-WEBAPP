"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
  variant?: "muted" | "brand" | "accent";
}

export function BackButton({
  href,
  label = "Back to Login",
  className,
  variant = "muted",
}: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue",
        variant === "muted" && "text-muted-foreground hover:text-brand",
        variant === "brand" && "text-brand hover:text-brand-700",
        variant === "accent" && "text-accent-blue hover:text-accent-blue-600",
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Link>
  );
}
