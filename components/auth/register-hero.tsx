"use client";

import { ShieldCheck, BadgeCheck, CreditCard } from "lucide-react";
import { Logo } from "@/components/auth";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Join India's Most Trusted Petrochemical Network",
    description: "Secure digital infrastructure for the petroleum ecosystem.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Supply Network",
    description: "Rigorous institutional vetting for supply chain reliability.",
  },
  {
    icon: CreditCard,
    title: "Institutional Credit Facilities",
    description:
      "Access structured financing tailored for large-scale operations.",
  },
] as const;

export function RegisterHero() {
  return (
    <div className="flex h-full flex-col text-white">
      <Logo variant="light" />

      <div className="my-auto space-y-10 py-12">
        <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
          Powering India&apos;s Industrial Future.
        </h2>

        <ul className="space-y-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3.5">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon
                  className="h-4.5 w-4.5 h-[18px] w-[18px] text-accent-blue-200"
                  aria-hidden
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-snug xl:text-base">
                  {title}
                </p>
                <p className="text-xs leading-relaxed text-white/70 xl:text-sm">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[11px] text-white/50">
        © 2024 PetroTrade Solutions. Institutional Trading Environment
      </p>
    </div>
  );
}
