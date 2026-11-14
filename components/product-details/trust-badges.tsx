"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_ASSURANCE_ITEMS = [
  {
    title: "Verified Supply Network",
    description: "Supplier verification follows platform onboarding checks.",
    status: "Applicable where supported",
  },
  {
    title: "Secure Payment Protection",
    description:
      "Payment protection follows the configured payment and settlement process.",
    status: "Applicable where supported",
  },
  {
    title: "Quality Inspection Available",
    description: "Third-party inspection can be requested where supported.",
    status: "Available on request",
  },
  {
    title: "Order and Fulfilment Support",
    description:
      "Purchase requests, dispatch coordination, and order tracking are handled on the platform.",
    status: "Applicable where supported",
  },
] as const;

const QUALITY_DOC_ITEM = {
  title: "Quality Documentation",
  description:
    "COA and grade certificates are available when a verified document is on file.",
  status: "On file",
} as const;

interface TrustBadgesProps {
  className?: string;
  compact?: boolean;
  /** Only show Quality Documentation when a verified TDS/COA exists. */
  hasQualityDocs?: boolean;
}

export function TrustBadges({
  className,
  compact = false,
  hasQualityDocs = false,
}: TrustBadgesProps) {
  const items = hasQualityDocs
    ? [
        BASE_ASSURANCE_ITEMS[0],
        QUALITY_DOC_ITEM,
        ...BASE_ASSURANCE_ITEMS.slice(1),
      ]
    : [...BASE_ASSURANCE_ITEMS];

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-3",
          className,
        )}
      >
        <p className="text-xs font-semibold text-slate-900">
          Platform Assurance
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Built for trusted industrial procurement
        </p>
        <ul className="mt-2 space-y-1.5">
          {items.slice(0, 3).map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-2 text-[11px] text-slate-600"
            >
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
          <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Platform Assurance
          </h2>
          <p className="text-xs text-slate-500">
            Built for trusted industrial procurement
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="h-3.5 w-3.5 shrink-0 text-brand"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-slate-800">
                {item.title}
              </p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {item.description}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {item.status}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
