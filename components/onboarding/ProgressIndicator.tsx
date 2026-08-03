"use client";

import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import { cn } from "@/lib/utils";
import type { OnboardingStepId } from "@/types/onboarding";

interface ProgressIndicatorProps {
  currentStepId: OnboardingStepId;
  className?: string;
}

export function ProgressIndicator({
  currentStepId,
  className,
}: ProgressIndicatorProps) {
  const completedSteps = useOnboardingStore((s) => s.completedSteps);
  const currentIndex = ONBOARDING_STEPS.findIndex(
    (s) => s.id === currentStepId,
  );
  const progress =
    ((completedSteps.length + (currentIndex >= 0 ? 0.5 : 0)) /
      ONBOARDING_STEPS.length) *
    100;

  return (
    <div
      className={cn("w-full", className)}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Onboarding progress"
    >
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>
          Step {currentIndex + 1} of {ONBOARDING_STEPS.length}
        </span>
        <span>{Math.min(100, Math.round(progress))}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}
