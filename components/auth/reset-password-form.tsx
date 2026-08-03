"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  FormError,
  PasswordInput,
  PrimaryButton,
  showSuccessToast,
} from "@/components/auth";
import { BackButton } from "@/components/auth/back-button";
import { PasswordStrengthIndicator } from "@/components/auth/password-strength-indicator";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/auth-schemas";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";
import { useEffect } from "react";

export function ResetPasswordForm() {
  const router = useRouter();
  const otpVerified = useAuthStore((s) => s.otpVerified);
  const forgotPasswordEmail = useAuthStore((s) => s.forgotPasswordEmail);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const password = useWatch({ control, name: "password" }) ?? "";
  const loading = isLoading || isSubmitting;

  useEffect(() => {
    if (!forgotPasswordEmail || !otpVerified) {
      router.replace(ROUTES.forgotPassword);
    }
  }, [forgotPasswordEmail, otpVerified, router]);

  const onSubmit = handleSubmit(async (values) => {
    await resetPassword(values.password);
    showSuccessToast("Password updated successfully.");
    router.push(ROUTES.passwordResetSuccess);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-md space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-[1.75rem]">
          Create New Password
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Please select a password that has not been used in your last 12
          session rotations.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <PasswordInput
          label="New Password"
          placeholder="Enter complex password"
          autoComplete="new-password"
          showLockIcon={false}
          error={errors.password?.message}
          disabled={loading}
          {...register("password")}
        />

        <PasswordStrengthIndicator password={password} />

        <PasswordInput
          label="Confirm Password"
          placeholder="Repeat new password"
          autoComplete="new-password"
          showLockIcon={false}
          error={errors.confirmPassword?.message}
          disabled={loading}
          {...register("confirmPassword")}
        />

        <FormError message={errors.root?.message} />

        <PrimaryButton type="submit" loading={loading}>
          Update Password
        </PrimaryButton>
      </form>

      <div className="flex justify-center pt-1">
        <BackButton
          href={ROUTES.login}
          label="Return to Login"
          variant="accent"
        />
      </div>
    </motion.div>
  );
}
