import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

/** Alias route — canonical wizard lives under /customer/onboarding */
export default function OnboardingAliasPage() {
  redirect(ROUTES.onboarding);
}
