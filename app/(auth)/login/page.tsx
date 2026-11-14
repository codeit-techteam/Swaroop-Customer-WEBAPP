import { Suspense } from "react";
import { AuthLayout, LoginForm } from "@/components/auth";
import { LoginHero } from "@/components/auth/login-hero";
import { pageMetadata } from "@/lib/seo";
import { ROUTES } from "@/constants";

export const metadata = pageMetadata({
  title: "Login",
  description:
    "Sign in to PolyStoreX Customer Portal with mobile number OTP verification",
  path: ROUTES.login,
});

export default function LoginPage() {
  return (
    <AuthLayout
      backgroundImage="/assets/images/auth-industrial-day.jpg"
      side={<LoginHero />}
    >
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}

function LoginFormFallback() {
  return (
    <div className="flex w-full max-w-[420px] items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-brand" />
    </div>
  );
}
