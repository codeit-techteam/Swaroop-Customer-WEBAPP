"use client";

import { Logo, AuthStat } from "@/components/auth";

export function LoginHero() {
  return (
    <div className="flex h-full flex-col text-white">
      <Logo variant="light" showTagline tagline="INDUSTRIAL PORTAL" />

      <div className="my-auto max-w-xl space-y-4 py-8">
        <h2 className="text-3xl font-bold leading-[1.15] tracking-tight xl:text-4xl">
          India&apos;s Largest B2B Petrochemical Marketplace
        </h2>
        <div className="h-1 w-16 rounded-full bg-accent-blue" aria-hidden />
        <p className="max-w-md text-sm leading-relaxed text-white/85 xl:text-base">
          Streamline your bulk chemical procurement with institutional-grade
          security, real-time logistics tracking, and verified enterprise
          credit.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
        <AuthStat value="500+" label="Industrial Units" />
        <AuthStat value="₹10K Cr+" label="Annual Trade Vol" />
        <AuthStat value="99.9%" label="Uptime Reliability" />
      </div>
    </div>
  );
}
