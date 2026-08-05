"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStepById } from "@/constants/onboarding";
import { ROUTES } from "@/constants";
import { useOnboardingStore } from "@/store/onboardingStore";

/**
 * Resume onboarding at the last saved step (or dashboard if already complete).
 */
export default function OnboardingIndexPage() {
  const router = useRouter();
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);
    const unsub = useOnboardingStore.persist.onFinishHydration(finish);
    if (useOnboardingStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  useEffect(() => {
    if (!ready) return;
    const started = useOnboardingStore.getState().hasStartedOnboarding;
    const completed = useOnboardingStore.getState().isCompleted;
    if (completed && started) {
      router.replace(ROUTES.dashboard);
      return;
    }
    router.replace(getStepById(currentStep).href);
  }, [ready, isCompleted, currentStep, router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50"
      role="status"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
      <span className="sr-only">Loading onboarding…</span>
    </div>
  );
}
