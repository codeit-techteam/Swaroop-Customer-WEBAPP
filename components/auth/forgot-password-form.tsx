"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AtSign, HelpCircle, RefreshCw } from "lucide-react";
import {
  AuthInput,
  FormError,
  PrimaryButton,
  showSuccessToast,
} from "@/components/auth";
import { BackButton } from "@/components/auth/back-button";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/auth-schemas";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

export function ForgotPasswordForm() {
  const router = useRouter();
  const sendResetCode = useAuthStore((s) => s.sendResetCode);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const loading = isLoading || isSubmitting;

  const onSubmit = handleSubmit(async (values) => {
    await sendResetCode(values.email);
    showSuccessToast("Verification code sent successfully.");
    router.push(ROUTES.forgotPasswordOtp);
  });

  return (
    <div className="flex w-full flex-1 flex-col">
      <BackButton
        href={ROUTES.login}
        label="Back to Login"
        className="mb-auto self-start"
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto my-auto w-full max-w-[420px] space-y-7 py-10"
      >
        <div className="space-y-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand shadow-sm ring-1 ring-brand/10"
            aria-hidden
          >
            <RefreshCw className="h-5 w-5" strokeWidth={2} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-[1.75rem]">
              Forgot Password
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Please enter the email address associated with your institutional
              account. We will send a secure verification code to reset your
              credentials.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <AuthInput
            label="Email Address"
            placeholder="name@petrotrade.com"
            type="email"
            autoComplete="email"
            leftIcon={AtSign}
            error={errors.email?.message}
            disabled={loading}
            {...register("email")}
          />

          <FormError message={errors.root?.message} />

          <PrimaryButton type="submit" loading={loading}>
            Send Reset Code
          </PrimaryButton>
        </form>

        <aside
          className="rounded-lg border border-border/60 bg-muted/50 px-4 py-3.5"
          aria-label="Enterprise assistance"
        >
          <div className="flex gap-3">
            <HelpCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue"
              aria-hidden
            />
            <div className="space-y-0.5 text-sm">
              <p className="font-semibold text-foreground">
                Need enterprise assistance?
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Contact your regional IT administrator or reach out to our{" "}
                <a
                  href="mailto:security@petrotrade.com"
                  className="font-medium text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
                >
                  Institutional Security Support
                </a>
                .
              </p>
            </div>
          </div>
        </aside>
      </motion.div>
    </div>
  );
}
