"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import { getStepById } from "@/constants/onboarding";
import type { OnboardingStepId } from "@/types/onboarding";

interface RouteGuardProps {
  stepId: OnboardingStepId;
  children: React.ReactNode;
}

/**
 * Prevents accessing future onboarding steps before prior steps are complete.
 * Redirects to the furthest allowed step.
 */
export function RouteGuard({ stepId, children }: RouteGuardProps) {
  const router = useRouter();
  const canAccessStep = useOnboardingStore((s) => s.canAccessStep);
  const completedSteps = useOnboardingStore((s) => s.completedSteps);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useOnboardingStore.persist.hasHydrated());
    return useOnboardingStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (canAccessStep(stepId)) return;

    const order: OnboardingStepId[] = [
      "company-information",
      "gst-verification",
      "business-address",
      "shipping-address",
      "credit-eligibility",
      "completion",
    ];

    let redirectId: OnboardingStepId = "company-information";
    for (const id of order) {
      if (id === "completion") {
        if (isCompleted || completedSteps.includes("credit-eligibility")) {
          redirectId = "completion";
        }
        break;
      }
      if (!completedSteps.includes(id)) {
        redirectId = id;
        break;
      }
      redirectId = id;
    }

    router.replace(getStepById(redirectId).href);
  }, [hydrated, canAccessStep, stepId, completedSteps, isCompleted, router]);

  if (!hydrated || !canAccessStep(stepId)) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center"
        role="status"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <span className="sr-only">Loading onboarding…</span>
      </div>
    );
  }

  return <>{children}</>;
}
