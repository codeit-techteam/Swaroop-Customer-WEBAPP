"use client";

import { Logo, AuthStat } from "@/components/auth";

export function LoginHero() {
  return (
    <div className="flex h-full flex-col text-white">
      <Logo variant="light" showTagline tagline="INDUSTRIAL PORTAL" />

      <div className="my-auto max-w-xl space-y-4 py-8">
        <h2 className="text-3xl font-bold leading-[1.15] tracking-tight xl:text-4xl">
          B2B Petrochemical Procurement for Indian Industry
        </h2>
        <div className="h-1 w-16 rounded-full bg-accent-blue" aria-hidden />
        <p className="max-w-md text-sm leading-relaxed text-white/85 xl:text-base">
          Source polymer grades, compare live offers, and manage purchase
          requests on PolyStoreX — operated by Veylron Polychem Private Limited.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
        <AuthStat value="Live" label="Marketplace Offers" />
        <AuthStat value="OTP" label="Secure Sign-In" />
        <AuthStat value="KYC" label="Verified Buyers" />
      </div>
    </div>
  );
}
