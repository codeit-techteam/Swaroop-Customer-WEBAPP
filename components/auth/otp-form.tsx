"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import {
  FormError,
  OtpInput,
  PrimaryButton,
  showSuccessToast,
} from "@/components/auth";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

const OTP_COUNTDOWN = 30;

function formatContact(contact: string | null): string {
  if (!contact) return "your registered contact";
  if (contact.includes("@")) return contact;
  const digits = contact.replace(/\D/g, "").slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return contact;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function OtpForm() {
  const router = useRouter();
  const pendingContact = useAuthStore((s) => s.pendingContact);
  const verifyOTP = useAuthStore((s) => s.verifyOTP);
  const resendOTP = useAuthStore((s) => s.resendOTP);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(OTP_COUNTDOWN);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!pendingContact) {
      router.replace(ROUTES.login);
    }
  }, [pendingContact, router]);

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
    showSuccessToast("OTP Sent Successfully");
  }, [resendOTP, secondsLeft]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit verification code");
      return;
    }

    setError(undefined);
    const result = await verifyOTP(otp);

    if (!result.success) {
      setError(result.message ?? "Invalid OTP");
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      router.push(ROUTES.dashboard);
    }, 900);
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      <AnimatePresence>
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/95"
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
            <p className="text-lg font-semibold text-brand">
              Verified Successfully
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard…
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Link
        href={ROUTES.login}
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Change Number
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand">
            Two-Step Verification
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We&apos;ve sent a 6-digit verification code to{" "}
            <span className="font-medium text-foreground">
              {formatContact(pendingContact)}
            </span>
          </p>
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
            className="font-semibold text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:cursor-not-allowed disabled:text-muted-foreground/50"
          >
            Resend OTP
          </button>
        </div>

        <PrimaryButton
          type="button"
          onClick={handleVerify}
          loading={isLoading}
          disabled={success}
          icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
        >
          Verify & Proceed
        </PrimaryButton>

        <p className="pt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Having trouble? Contact our institutional support at{" "}
          <a
            href="mailto:support@petrotrade.com"
            className="font-medium text-accent-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            support@petrotrade.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
