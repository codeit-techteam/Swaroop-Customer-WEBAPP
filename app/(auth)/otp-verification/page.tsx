import type { Metadata } from "next";
import { Suspense } from "react";
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
      <Suspense
        fallback={
          <div className="flex w-full max-w-md items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
          </div>
        }
      >
        <OtpForm />
      </Suspense>
    </AuthLayout>
  );
}
