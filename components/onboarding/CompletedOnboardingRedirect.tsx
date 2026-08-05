"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import { setOnboardingCompleteCookie } from "@/lib/onboarding-cookie";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";

interface CompletedOnboardingRedirectProps {
  children: ReactNode;
}

/**
 * Guards the onboarding wizard:
 * - Requires authentication
 * - Redirects fully completed users to the dashboard
 * - Syncs the middleware onboarding cookie from persisted state
 */
export function CompletedOnboardingRedirect({
  children,
}: CompletedOnboardingRedirectProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
  const hasStartedOnboarding = useOnboardingStore(
    (s) => s.hasStartedOnboarding,
  );
  const [ready, setReady] = useState(false);

  const mustStayInWizard = hasStartedOnboarding && !isCompleted;
  const shouldLeaveWizard = isCompleted && hasStartedOnboarding;

  useEffect(() => {
    const finish = () => setReady(true);
    const unsubAuth = useAuthStore.persist.onFinishHydration(finish);
    const unsubOnboarding =
      useOnboardingStore.persist.onFinishHydration(finish);
    if (
      useAuthStore.persist.hasHydrated() &&
      useOnboardingStore.persist.hasHydrated()
    ) {
      finish();
    }
    return () => {
      unsubAuth();
      unsubOnboarding();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    setOnboardingCompleteCookie(!mustStayInWizard);

    if (!isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }
    if (shouldLeaveWizard) {
      router.replace(ROUTES.dashboard);
    }
  }, [ready, isAuthenticated, mustStayInWizard, shouldLeaveWizard, router]);

  if (!ready || !isAuthenticated || shouldLeaveWizard) {
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
