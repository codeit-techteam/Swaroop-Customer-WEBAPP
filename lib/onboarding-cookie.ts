/**
 * Cookie bridge so middleware can enforce onboarding without reading localStorage.
 */

export const ONBOARDING_COMPLETE_COOKIE = "pt_onboarding_complete";

export function setOnboardingCompleteCookie(completed: boolean): void {
  if (typeof document === "undefined") return;
  const value = completed ? "1" : "0";
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${ONBOARDING_COMPLETE_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearOnboardingCompleteCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${ONBOARDING_COMPLETE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** True when a new registration started onboarding and has not finished. */
export function readOnboardingIncompleteFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("pt-customer-onboarding");
    if (!raw) return false;
    const parsed = JSON.parse(raw) as {
      state?: { isCompleted?: boolean; hasStartedOnboarding?: boolean };
    };
    return (
      parsed?.state?.hasStartedOnboarding === true &&
      parsed?.state?.isCompleted === false
    );
  } catch {
    return false;
  }
}

export function readOnboardingCompletedFromStorage(): boolean {
  return !readOnboardingIncompleteFromStorage();
}
