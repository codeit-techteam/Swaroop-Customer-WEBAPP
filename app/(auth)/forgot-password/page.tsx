import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ForgotPasswordHero } from "@/components/auth/forgot-password-hero";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your PetroTrade institutional account password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      backgroundImage="/assets/images/auth-industrial-day.jpg"
      side={<ForgotPasswordHero />}
      contentClassName="items-stretch justify-start py-6 sm:py-8"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
