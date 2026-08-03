"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
} from "lucide-react";
import {
  FormError,
  OtpInput,
  PrimaryButton,
  showSuccessToast,
} from "@/components/auth";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

const OTP_COUNTDOWN = 30;

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function OtpVerificationCard() {
  const router = useRouter();
  const email = useAuthStore((s) => s.forgotPasswordEmail);
  const verifyResetOTP = useAuthStore((s) => s.verifyResetOTP);
  const resendOTP = useAuthStore((s) => s.resendOTP);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(OTP_COUNTDOWN);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.replace(ROUTES.forgotPassword);
    }
  }, [email, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const handleResend = useCallback(() => {
    if (secondsLeft > 0) return;
    resendOTP();
    setOtp("");
    setError(undefined);
    setSecondsLeft(OTP_COUNTDOWN);
    showSuccessToast("Verification code resent successfully.");
  }, [resendOTP, secondsLeft]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code");
      return;
    }

    setError(undefined);
    const result = await verifyResetOTP(otp);

    if (!result.success) {
      setError(result.message ?? "Invalid verification code");
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      router.push(ROUTES.resetPassword);
    }, 700);
  };

  return (
    <div className="relative mx-auto flex h-full w-full max-w-md flex-col justify-center py-8">
      <AnimatePresence>
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/95"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <CheckCircle2
                className="h-16 w-16 text-emerald-500"
                aria-hidden
              />
            </motion.div>
            <p className="text-lg font-semibold text-brand">Code Verified</p>
            <p className="text-sm text-muted-foreground">
              Proceeding to reset password…
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand ring-1 ring-brand/10"
            aria-hidden
          >
            <Shield className="h-5 w-5" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-[1.75rem]">
              Verification Required
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We&apos;ve sent a 6-digit code to{" "}
              <span className="font-semibold text-foreground">
                {email ?? "your email"}
              </span>
              . Please enter it below to reset your credentials.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <OtpInput
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (error) setError(undefined);
            }}
            disabled={isLoading || success}
            error={!!error}
            variant="outlined"
          />
          <FormError message={error} />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <div
            className="inline-flex items-center gap-1.5 text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <span className="font-medium tabular-nums">
              {formatTimer(secondsLeft)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft > 0 || isLoading}
            className="font-medium text-muted-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:cursor-not-allowed disabled:text-muted-foreground/40"
          >
            Resend Code
          </button>
        </div>

        <PrimaryButton
          type="button"
          onClick={handleVerify}
          loading={isLoading}
          disabled={success}
          icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        >
          Verify & Proceed
        </PrimaryButton>

        <p className="text-center">
          <Link
            href={ROUTES.login}
            className="text-sm font-medium text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            Back to Sign In
          </Link>
        </p>
      </motion.div>

      <div className="mt-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-12 text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground/80 sm:justify-between">
        <span className="inline-flex items-center gap-1.5">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          ISO 27001 Certified
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          SOC2 Compliant
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" aria-hidden />
          EU GDPR Ready
        </span>
      </div>
    </div>
  );
}
