"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface HelpCardProps {
  variant?: "card" | "button" | "support";
  className?: string;
}

export function HelpCard({ variant = "card", className }: HelpCardProps) {
  if (variant === "button") {
    return (
      <Link
        href={ROUTES.support}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
          className,
        )}
        aria-label="Need help with onboarding"
      >
        <HelpCircle className="h-4 w-4" aria-hidden="true" />
        Need Help?
      </Link>
    );
  }

  if (variant === "support") {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-slate-100 p-3",
          className,
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Need Help?</p>
            <p className="text-xs text-slate-500">Live Trading Support</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <p className="mb-3 text-sm text-slate-600">
        Having trouble with verification?
      </p>
      <Link
        href={ROUTES.support}
        className={cn(
          "inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
        )}
      >
        Need Help?
      </Link>
    </div>
  );
}
