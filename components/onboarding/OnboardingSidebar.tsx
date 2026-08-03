"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Factory } from "lucide-react";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { HelpCard } from "@/components/onboarding/HelpCard";
import { cn } from "@/lib/utils";

interface OnboardingSidebarProps {
  className?: string;
  helpVariant?: "card" | "button" | "support";
}

export function OnboardingSidebar({
  className,
  helpVariant = "card",
}: OnboardingSidebarProps) {
  const pathname = usePathname();
  const completedSteps = useOnboardingStore((s) => s.completedSteps);
  const canAccessStep = useOnboardingStore((s) => s.canAccessStep);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);

  return (
    <aside
      className={cn(
        "flex w-full flex-col border-r border-slate-200 bg-slate-50 lg:w-64 xl:w-72",
        className,
      )}
      aria-label="Onboarding progress"
    >
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Factory className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Onboarding Wizard
            </p>
            <p className="text-xs text-slate-500">6 Steps to Verification</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Onboarding steps">
        {ONBOARDING_STEPS.map((step) => {
          const isActive = pathname === step.href;
          const isStepCompleted =
            completedSteps.includes(step.id) ||
            (step.id === "completion" && isCompleted);
          const canAccess = canAccessStep(step.id);
          const Icon = step.icon;
          const showGreenCheck =
            isStepCompleted && !isActive && step.id !== "completion";

          const content = (
            <>
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isActive && "bg-white/15 text-white",
                  showGreenCheck && "bg-emerald-100 text-emerald-600",
                  !isActive &&
                    !showGreenCheck &&
                    "bg-transparent text-slate-400",
                )}
              >
                {showGreenCheck ? (
                  <Check
                    className="h-4 w-4"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span
                className={cn(
                  "truncate text-sm font-medium",
                  isActive && "text-white",
                  showGreenCheck && "text-emerald-700",
                  !isActive && !showGreenCheck && "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </>
          );

          if (isActive) {
            return (
              <motion.div
                key={step.id}
                layoutId="active-onboarding-step"
                className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-white shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                aria-current="step"
              >
                {content}
              </motion.div>
            );
          }

          if (canAccess) {
            return (
              <Link
                key={step.id}
                href={step.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900",
                  showGreenCheck ? "hover:bg-emerald-50" : "hover:bg-slate-100",
                )}
                aria-label={`${step.label}${isStepCompleted ? " (completed)" : ""}`}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={step.id}
              className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 opacity-60"
              aria-disabled="true"
              title="Complete previous steps to unlock"
            >
              {content}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 p-4">
        <HelpCard variant={helpVariant} />
      </div>
    </aside>
  );
}
