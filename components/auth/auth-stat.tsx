"use client";

import { cn } from "@/lib/utils";

interface AuthStatProps {
  value: string;
  label: string;
  className?: string;
}

export function AuthStat({ value, label, className }: AuthStatProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-2xl font-bold tracking-tight text-white xl:text-3xl">
        {value}
      </span>
      <span className="text-xs font-medium text-white/70 xl:text-sm">
        {label}
      </span>
    </div>
  );
}
