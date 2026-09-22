"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Mail, MessageSquare, Phone } from "lucide-react";
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
import {
  createLoginSchema,
  type LoginFormValues,
  type LoginMethod,
} from "@/lib/auth-schemas";
import { getPostAuthDestination } from "@/lib/post-auth-redirect";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

const LOGIN_METHOD_OPTIONS: Array<{
  value: LoginMethod;
  label: string;
  icon: typeof Mail;
}> = [
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const continueWithOTP = useAuthStore((s) => s.continueWithOTP);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const loginMethodRef = useRef(loginMethod);
  loginMethodRef.current = loginMethod;

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: async (values, context, options) =>
      zodResolver(createLoginSchema(loginMethodRef.current))(
        values,
        context,
        options,
      ),
    defaultValues: {
      identifier: "customer@test.local",
      password: "Test@12345",
      rememberMe: false,
    },
  });

  const loading = isLoading || isSubmitting;
  const isEmailMethod = loginMethod === "email";

  const switchLoginMethod = (method: LoginMethod) => {
    if (method === loginMethod) return;
    setLoginMethod(method);
    setValue("identifier", method === "phone" ? "8240890242" : "customer@test.local");
    clearErrors("identifier");
  };

  const onLogin = handleSubmit(async (values) => {
    const result = await login(
      values.identifier,
      values.password,
      values.rememberMe,
    );
    if (!result.ok) {
      setError("root", {
        message:
          result.message ??
          "Invalid credentials. Use the same account as the Customer APP.",
      });
      return;
    }
    const next = searchParams.get("next");
    router.push(getPostAuthDestination(next));
  });

  const onContinueWithOtp = async () => {
    const identifier = getValues("identifier");
    const result = createLoginSchema(loginMethod)
      .pick({ identifier: true })
      .safeParse({ identifier });

    if (!result.success) {
      const message =
        result.error.flatten().fieldErrors.identifier?.[0] ??
        (isEmailMethod ? "Email is required" : "Phone is required");
      setError("identifier", { message });
      return;
    }

    const sent = await continueWithOTP(result.data.identifier);
    if (!sent.ok) {
      setError("root", { message: sent.message ?? "Unable to send OTP" });
      return;
    }
    router.push(ROUTES.otpVerification);
  };

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center">
      <AuthCard className="w-full p-6 sm:p-8">
        <div className="mb-5 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-brand">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Login to access your industrial trade dashboard
          </p>
        </div>

        <form onSubmit={onLogin} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Login with
            </p>
            <div
              role="tablist"
              aria-label="Login method"
              className="grid grid-cols-2 gap-1 rounded-md border border-input bg-muted/40 p-1"
            >
              {LOGIN_METHOD_OPTIONS.map((option) => {
                const active = loginMethod === option.value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={loading}
                    onClick={() => switchLoginMethod(option.value)}
                    className={cn(
                      "inline-flex h-9 items-center justify-center gap-2 rounded-sm text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      active
                        ? "bg-white text-brand shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <AuthInput
            key={loginMethod}
            label={isEmailMethod ? "Email Address" : "Mobile Number"}
            placeholder={
              isEmailMethod
                ? "e.g. procurement@reliance.com"
                : "e.g. 98765 43210"
            }
            leftIcon={isEmailMethod ? Mail : Phone}
            type={isEmailMethod ? "email" : "tel"}
            inputMode={isEmailMethod ? "email" : "numeric"}
            autoComplete={isEmailMethod ? "email" : "tel"}
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

        <div className="mt-4 space-y-4">
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

          <p className="text-center text-xs text-muted-foreground">
            Same Customer APP account:{" "}
            <span className="font-medium text-foreground">customer@test.local</span>{" "}
            / <span className="font-medium text-foreground">8240890242</span>
            <br />
            Password <span className="font-medium text-foreground">Test@12345</span>
            {" · "}
            OTP <span className="font-medium text-foreground">123456</span>
          </p>

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

      <AuthFooter className="mt-5" />
    </div>
  );
}
