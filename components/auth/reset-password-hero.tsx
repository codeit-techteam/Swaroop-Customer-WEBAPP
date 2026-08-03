"use client";

import { Shield } from "lucide-react";

export function ResetPasswordHero() {
  return (
    <div className="flex h-full flex-col justify-end text-white">
      <div className="mb-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white ring-1 ring-white/25 backdrop-blur-sm">
          <Shield className="h-3 w-3" aria-hidden />
          Enterprise Security
        </div>
      </div>

      <div className="max-w-sm space-y-3 pb-2">
        <h2 className="text-2xl font-bold leading-tight tracking-tight xl:text-3xl">
          Institutional-Grade Account Protection
        </h2>
        <p className="text-sm leading-relaxed text-white/80">
          Our multi-layered security protocol ensures your trading credentials
          remain encrypted and compliant with global petroleum commerce
          standards.
        </p>
      </div>
    </div>
  );
}
