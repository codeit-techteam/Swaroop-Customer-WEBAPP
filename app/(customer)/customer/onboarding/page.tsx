import { redirect } from "next/navigation";
import { ONBOARDING_ROUTES } from "@/constants/onboarding";

export default function OnboardingIndexPage() {
  redirect(ONBOARDING_ROUTES.companyInformation);
}
