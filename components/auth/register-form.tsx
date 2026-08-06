"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import {
  AuthCard,
  AuthCheckbox,
  AuthInput,
  FormError,
  PasswordInput,
  PrimaryButton,
} from "@/components/auth";
import { registerSchema, type RegisterFormValues } from "@/lib/auth-schemas";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { ROUTES } from "@/constants";

export function RegisterForm() {
  const router = useRouter();
  const registerUser = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const loading = isLoading || isSubmitting;

  const onSubmit = handleSubmit(async (values) => {
    const onboarding = useOnboardingStore.getState();
    onboarding.reset();
    onboarding.seedCompanyLegalName(values.businessName);
    await registerUser({
      businessName: values.businessName,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });
    router.push(ROUTES.otpVerification);
  });

  return (
    <AuthCard size="wide" className="w-full max-w-[560px]">
      <div className="mb-7 space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Corporate Registration
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete your enterprise profile to access the trading terminal.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthInput
          label="Business Name (Full Legal Name)"
          placeholder="Enter your company's legal name"
          autoComplete="organization"
          error={errors.businessName?.message}
          disabled={loading}
          {...register("businessName")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <AuthInput
            label="Email Address (Corporate)"
            placeholder="name@company.com"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            disabled={loading}
            {...register("email")}
          />
          <AuthInput
            label="Mobile Number"
            placeholder="+91 98765 43210"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            disabled={loading}
            {...register("phone")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput
            label="Create Password"
            placeholder="••••••••"
            autoComplete="new-password"
            showLockIcon={false}
            error={errors.password?.message}
            disabled={loading}
            {...register("password")}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="••••••••"
            autoComplete="new-password"
            showLockIcon={false}
            error={errors.confirmPassword?.message}
            disabled={loading}
            {...register("confirmPassword")}
          />
        </div>

        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <AuthCheckbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={loading}
              error={errors.acceptTerms?.message}
              label={
                <>
                  I agree to the{" "}
                  <Link
                    href="#"
                    className="font-medium text-accent-blue hover:underline"
                  >
                    Master Service Agreement
                  </Link>
                  , Privacy Policy, and institutional trading protocols.
                </>
              }
            />
          )}
        />

        <FormError message={errors.root?.message} />

        <PrimaryButton
          type="submit"
          loading={loading}
          className="mt-2"
          icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        >
          Register & Continue
        </PrimaryButton>

        <p className="pt-1 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={ROUTES.login}
            className="font-semibold text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
