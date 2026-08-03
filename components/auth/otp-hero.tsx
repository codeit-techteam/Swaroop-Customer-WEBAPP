"use client";

import { Logo } from "@/components/auth";

export function OtpHero() {
  return (
    <div className="flex h-full flex-col text-white">
      <Logo variant="light" />

      <div className="my-auto max-w-sm space-y-4 py-12">
        <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
          Secure Your <span className="text-sky-300">Trade.</span>
        </h2>
        <p className="text-sm leading-relaxed text-white/80 xl:text-base">
          Access the global petrochemical marketplace with institutional-grade
          security and real-time verification protocols.
        </p>
      </div>

      <div className="flex gap-6 border-t border-white/15 pt-6">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">Industrial Reliability</p>
          <p className="text-xs text-white/60">
            ISO 27001 Certified Environment
          </p>
        </div>
        <div className="w-px bg-white/20" aria-hidden />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold">Enterprise Security</p>
          <p className="text-xs text-white/60">End-to-End Encryption</p>
        </div>
      </div>
    </div>
  );
}
