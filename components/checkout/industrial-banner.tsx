"use client";

import { CHECKOUT_INDUSTRIAL_BANNER } from "./constants";

export function IndustrialBanner() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
      <div className="relative h-[180px] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CHECKOUT_INDUSTRIAL_BANNER.imageUrl}
          alt="Industrial petrochemical facility"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/25" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/95 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-10 sm:px-6">
          {CHECKOUT_INDUSTRIAL_BANNER.features.map((feature) => (
            <div key={feature} className="mb-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <p className="text-[13px] font-semibold leading-snug text-slate-900">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
