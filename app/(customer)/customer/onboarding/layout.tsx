import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Customer Onboarding",
  description:
    "Complete your PetroTrade customer onboarding — company details, GST verification, addresses, and credit eligibility.",
};

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
