"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Phone, ShieldCheck } from "lucide-react";
import {
  AuthCard,
  AuthCheckbox,
  AuthFooter,
  FormError,
  PrimaryButton,
} from "@/components/auth";
import { otpLoginSchema, type OtpLoginFormValues } from "@/lib/auth-schemas";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

/** Local dev only — never enable in production. */
const SHOW_DEMO_OTP = process.env.NEXT_PUBLIC_DEMO_OTP === "true";

function formatPhoneDisplay(digits: string): string {
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const continueWithOTP = useAuthStore((s) => s.continueWithOTP);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OtpLoginFormValues>({
    resolver: zodResolver(otpLoginSchema),
    defaultValues: {
      phone: SHOW_DEMO_OTP ? "8240890242" : "",
      rememberMe: false,
    },
  });

  const loading = isLoading || isSubmitting;

  const onSendOtp = handleSubmit(async (values) => {
    const sent = await continueWithOTP(values.phone);
    if (!sent.ok) {
      setError("root", { message: sent.message ?? "Unable to send OTP" });
      return;
    }

    useAuthStore.setState({ rememberMe: values.rememberMe });

    const next = searchParams.get("next");
    const otpUrl = next
      ? `${ROUTES.otpVerification}?next=${encodeURIComponent(next)}`
      : ROUTES.otpVerification;
    router.push(otpUrl);
  });

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center">
      <AuthCard className="w-full p-6 sm:p-8">
        <div className="mb-5 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-brand">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your mobile number and OTP
          </p>
        </div>

        <form onSubmit={onSendOtp} className="space-y-4" noValidate>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-blue/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-blue">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Mobile OTP login
          </div>

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <label
                  htmlFor="login-phone"
                  className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone
                      className="h-4 w-4 text-muted-foreground/70"
                      aria-hidden
                    />
                    <span className="text-foreground/80">+91</span>
                    <span className="h-4 w-px bg-input" aria-hidden />
                  </span>
                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="98765 43210"
                    maxLength={11}
                    disabled={loading}
                    aria-invalid={!!errors.phone}
                    aria-describedby={
                      errors.phone ? "login-phone-error" : "login-phone-hint"
                    }
                    value={formatPhoneDisplay(field.value ?? "")}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      field.onChange(digits);
                    }}
                    className={cn(
                      "flex h-11 w-full rounded-md border border-input bg-white pl-[5.25rem] pr-3 text-sm text-foreground transition-colors",
                      "placeholder:text-muted-foreground/60",
                      "focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/40",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      errors.phone &&
                        "border-destructive focus-visible:ring-destructive/30",
                    )}
                  />
                </div>
                {errors.phone ? (
                  <p
                    id="login-phone-error"
                    role="alert"
                    className="text-xs font-medium text-destructive"
                  >
                    {errors.phone.message}
                  </p>
                ) : (
                  <p
                    id="login-phone-hint"
                    className="text-xs text-muted-foreground"
                  >
                    We&apos;ll send a 6-digit code to this number
                  </p>
                )}
              </div>
            )}
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
            icon={<MessageSquare className="h-4 w-4" aria-hidden />}
            iconPosition="left"
          >
            Send OTP
          </PrimaryButton>
        </form>

        <div className="mt-5 space-y-4">
          {SHOW_DEMO_OTP ? (
            <p className="text-center text-xs text-muted-foreground">
              Demo number{" "}
              <span className="font-medium text-foreground">8240890242</span>
              {" · "}
              OTP <span className="font-medium text-foreground">123456</span>
            </p>
          ) : null}

          <p className="text-center text-sm text-muted-foreground">
            New to PolyStoreX?{" "}
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
