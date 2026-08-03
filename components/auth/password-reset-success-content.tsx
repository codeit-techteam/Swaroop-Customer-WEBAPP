"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/auth";
import { SuccessCard } from "@/components/auth/success-card";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

export function PasswordResetSuccessContent() {
  const router = useRouter();
  const passwordResetCompleted = useAuthStore((s) => s.passwordResetCompleted);
  const clearResetFlow = useAuthStore((s) => s.clearResetFlow);

  useEffect(() => {
    if (!passwordResetCompleted) {
      router.replace(ROUTES.forgotPassword);
    }
  }, [passwordResetCompleted, router]);

  const handleBackToLogin = () => {
    clearResetFlow();
    router.push(ROUTES.login);
  };

  return (
    <SuccessCard
      title="Password Updated Successfully"
      description="Your account security credentials have been successfully modified. Your new password is now active and your account remains protected by our institutional security protocol."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Having trouble?{" "}
          <Link
            href="mailto:security@petrotrade.com"
            className="font-medium text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            Contact Security Support
          </Link>
        </p>
      }
    >
      <PrimaryButton
        type="button"
        onClick={handleBackToLogin}
        icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        className="shadow-md"
      >
        Back to Login
      </PrimaryButton>
    </SuccessCard>
  );
}
