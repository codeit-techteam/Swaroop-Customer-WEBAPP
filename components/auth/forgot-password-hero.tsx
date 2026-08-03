"use client";

import { Globe, Shield } from "lucide-react";
import { Logo } from "@/components/auth";

export function ForgotPasswordHero() {
  return (
    <div className="flex h-full flex-col text-white">
      <div>
        <Logo variant="light" href={undefined} />
        <div
          className="mt-2 h-0.5 w-12 rounded-full bg-accent-blue"
          aria-hidden
        />
      </div>

      <div className="my-auto max-w-xl space-y-5 py-16">
        <h2 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
          Reliable Energy Trading Infrastructure.
        </h2>
        <p className="max-w-lg text-base leading-relaxed text-white/85 xl:text-lg">
          Our high-performance workstation is engineered for mission-critical
          operations, ensuring data integrity and transactional transparency
          across the global petrochemical supply chain.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/70">
        <p>© 2024 PetroTrade Solutions.</p>
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" aria-hidden />
            Global Access
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" aria-hidden />
            Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
