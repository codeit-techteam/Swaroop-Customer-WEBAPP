"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Mail, MessageSquare } from "lucide-react";
import {
  AuthCard,
  AuthCheckbox,
  AuthDivider,
  AuthFooter,
  AuthInput,
  FormError,
  PasswordInput,
  PrimaryButton,
  SecondaryButton,
} from "@/components/auth";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const continueWithOTP = useAuthStore((s) => s.continueWithOTP);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const loading = isLoading || isSubmitting;

  const onLogin = handleSubmit(async (values) => {
    await login(values.identifier, values.password, values.rememberMe);
    router.push(ROUTES.dashboard);
  });

  const onContinueWithOtp = async () => {
    const identifier = getValues("identifier");
    const result = loginSchema
      .pick({ identifier: true })
      .safeParse({ identifier });

    if (!result.success) {
      const message =
        result.error.flatten().fieldErrors.identifier?.[0] ??
        "Email or phone is required";
      setError("identifier", { message });
      return;
    }

    continueWithOTP(result.data.identifier);
    router.push(ROUTES.otpVerification);
  };

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center">
      <AuthCard className="w-full">
        <div className="mb-7 space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-brand">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Login to access your industrial trade dashboard
          </p>
        </div>

        <form onSubmit={onLogin} className="space-y-5" noValidate>
          <AuthInput
            label="Email or Phone"
            placeholder="e.g. procurement@reliance.com"
            leftIcon={Mail}
            autoComplete="username"
            error={errors.identifier?.message}
            disabled={loading}
            {...register("identifier")}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            disabled={loading}
            labelAction={
              <Link
                href={ROUTES.forgotPassword}
                className="text-xs font-medium text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
              >
                Forgot Password?
              </Link>
            }
            {...register("password")}
          />

          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <AuthCheckbox
                checked={field.value}
                onCheckedChange={field.onChange}
                label="Remember Me"
                disabled={loading}
              />
            )}
          />

          <FormError message={errors.root?.message} />

          <PrimaryButton
            type="submit"
            loading={loading}
            icon={<LogIn className="h-4 w-4" aria-hidden />}
            iconPosition="right"
          >
            Login
          </PrimaryButton>
        </form>

        <div className="mt-5 space-y-5">
          <AuthDivider />

          <SecondaryButton
            type="button"
            onClick={onContinueWithOtp}
            disabled={loading}
            icon={
              <MessageSquare className="h-4 w-4 text-accent-blue" aria-hidden />
            }
          >
            Continue with OTP
          </SecondaryButton>

          <p className="text-center text-sm text-muted-foreground">
            New to PetroTrade?{" "}
            <Link
              href={ROUTES.register}
              className="font-semibold text-accent-blue transition-colors hover:text-accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
            >
              Create Account
            </Link>
          </p>
        </div>
      </AuthCard>

      <AuthFooter className="mt-8" />
    </div>
  );
}
