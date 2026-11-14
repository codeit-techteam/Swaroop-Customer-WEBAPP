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

function isOnboardingOrKycPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname.startsWith(ROUTES.onboarding) ||
    pathname === ROUTES.kyc ||
    pathname.startsWith(`${ROUTES.kyc}/`) ||
    pathname === ROUTES.marketplace ||
    pathname.startsWith(`${ROUTES.marketplace}/`) ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/grades")
  );
}

/**
 * Soft-gates transactional chrome when onboarding/KYC is incomplete.
 * Marketplace + KYC remain reachable. Other modules render with KycFeatureGate.
 * Never redirects to Dashboard from a stale localStorage isCompleted flag.
 */
export function OnboardingGate({ children }: OnboardingGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const mustComplete = useMustCompleteOnboarding();
  const isCompleted = useOnboardingStore((s) => s.isCompleted);
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
    // Force resume only for the dedicated onboarding wizard entry — not for
    // marketplace / KYC / account modules (those use KycFeatureGate messaging).
    if (!mustComplete) return;
    if (
      pathname !== ROUTES.onboarding &&
      !pathname?.startsWith(`${ROUTES.onboarding}/`)
    ) {
      return;
    }
    if (isCompleted) return;
    const resume = getOnboardingResumePath({ trustCompletedFlag: false });
    if (resume !== pathname) {
      router.replace(resume);
    }
  }, [ready, isAuthenticated, mustComplete, isCompleted, pathname, router]);

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

  // Allow browse + KYC while incomplete; do not blank the shell.
  if (isAuthenticated && mustComplete && isOnboardingOrKycPath(pathname)) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
