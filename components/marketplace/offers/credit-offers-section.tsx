"use client";

import Link from "next/link";
import { Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { creditOfferCardsMock } from "@/mock/offers";
import { cn } from "@/lib/utils";

interface CreditOffersSectionProps {
  className?: string;
}

export function CreditOffersSection({ className }: CreditOffersSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-gradient-to-br from-brand to-brand-700 p-5 text-white shadow-elevated md:p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Credit Offers</h2>
          <p className="mt-0.5 text-sm text-white/75">
            Finance-backed payment options for eligible enterprise buyers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {creditOfferCardsMock.map((card) => (
          <div
            key={card.id}
            className="flex flex-col rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
              {card.highlight}
            </p>
            <h3 className="mt-2 text-base font-semibold">{card.title}</h3>
            <p className="mt-1 flex-1 text-sm text-white/75">
              {card.description}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-white/60">
              <Building2 className="h-3.5 w-3.5" />
              {card.financePartner}
            </p>
            <Button
              asChild
              className="mt-4 h-10 rounded-xl bg-white font-semibold text-brand hover:bg-slate-100"
            >
              <Link href={card.href}>{card.ctaLabel}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
