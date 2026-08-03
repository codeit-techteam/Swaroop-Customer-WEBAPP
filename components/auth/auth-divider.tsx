"use client";

import { cn } from "@/lib/utils";

interface AuthDividerProps {
  label?: string;
  className?: string;
}

export function AuthDivider({ label = "OR", className }: AuthDividerProps) {
  return (
    <div
      className={cn("relative flex items-center py-1", className)}
      role="separator"
      aria-label={label}
    >
      <div className="h-px flex-1 bg-border" />
      <span className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
