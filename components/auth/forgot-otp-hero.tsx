"use client";

import { KeyRound, ShieldCheck } from "lucide-react";
import { SecurityInfoCard } from "@/components/auth/security-info-card";

export function ForgotOtpHero() {
  return (
    <div className="flex h-full flex-col text-white">
      <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white ring-1 ring-white/20 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
        System Operational
      </div>

      <div className="my-auto max-w-lg py-10">
        <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
          Institutional Grade Security for Global Trade.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SecurityInfoCard
          icon={ShieldCheck}
          title="MFA Required"
          description="Multi-factor authentication is mandatory for all institutional procurement accounts."
        />
        <SecurityInfoCard
          icon={KeyRound}
          title="Encryption"
          description="All verification protocols utilize AES-256 bit institutional-grade encryption."
        />
      </div>
    </div>
  );
}
