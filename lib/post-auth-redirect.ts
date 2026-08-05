import { ROUTES } from "@/constants";
import { ONBOARDING_ROUTES, getStepById } from "@/constants/onboarding";
import { readOnboardingCompletedFromStorage } from "@/lib/onboarding-cookie";
import type { OnboardingStepId } from "@/types/onboarding";

/**
 * Destination after successful login / OTP.
 * Incomplete onboarding always wins over dashboard / ?next=.
 */
export function getPostAuthDestination(nextPath?: string | null): string {
  const completed = readOnboardingCompletedFromStorage();
  if (!completed) {
    return getOnboardingResumePath();
  }

  if (
    nextPath &&
    nextPath.startsWith("/") &&
    !nextPath.startsWith("//") &&
    !nextPath.startsWith(ROUTES.login) &&
    !nextPath.startsWith(ROUTES.register)
  ) {
    return nextPath;
  }

  return ROUTES.dashboard;
}

export function getOnboardingResumePath(): string {
  if (typeof window === "undefined") {
    return ONBOARDING_ROUTES.companyInformation;
  }

  try {
    const raw = localStorage.getItem("pt-customer-onboarding");
    if (!raw) return ONBOARDING_ROUTES.companyInformation;
    const parsed = JSON.parse(raw) as {
      state?: {
        isCompleted?: boolean;
        currentStep?: OnboardingStepId;
        completedSteps?: OnboardingStepId[];
      };
    };
    if (parsed?.state?.isCompleted) return ROUTES.dashboard;

    const step = parsed?.state?.currentStep ?? "company-information";
    return getStepById(step).href;
  } catch {
    return ONBOARDING_ROUTES.companyInformation;
  }
}
