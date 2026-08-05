"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import { getOnboardingResumePath } from "@/lib/post-auth-redirect";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";

interface OnboardingGateProps {
  children: ReactNode;
}

function useMustCompleteOnboarding() {
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
  const hasStartedOnboarding = useOnboardingStore(
    (s) => s.hasStartedOnboarding,
  );
  return hasStartedOnboarding && !isCompleted;
}

/**
 * Blocks customer app chrome until onboarding is completed.
 * Redirects authenticated incomplete users to the onboarding wizard.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mustComplete = useMustCompleteOnboarding();
  const [ready, setReady] = useState(false);

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
    if (!isAuthenticated) return;
    if (!mustComplete) return;
    if (pathname?.startsWith(ROUTES.onboarding)) return;
    router.replace(getOnboardingResumePath());
  }, [ready, isAuthenticated, mustComplete, pathname, router]);

  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50"
        role="status"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (
    isAuthenticated &&
    mustComplete &&
    !pathname?.startsWith(ROUTES.onboarding)
  ) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50"
        role="status"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
        <span className="sr-only">Redirecting to onboarding…</span>
      </div>
    );
  }

  return <>{children}</>;
}
