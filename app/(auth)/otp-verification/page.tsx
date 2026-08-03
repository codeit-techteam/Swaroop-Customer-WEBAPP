import type { Metadata } from "next";
import { AuthLayout, OtpForm } from "@/components/auth";
import { OtpHero } from "@/components/auth/otp-hero";

export const metadata: Metadata = {
  title: "OTP Verification",
  description: "Verify your identity with a one-time password",
};

export default function OtpVerificationPage() {
  return (
    <AuthLayout
      variant="centered"
      backgroundImage="/assets/images/auth-industrial-night.jpg"
      side={<OtpHero />}
    >
      <OtpForm />
    </AuthLayout>
  );
}
