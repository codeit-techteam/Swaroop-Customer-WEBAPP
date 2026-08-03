import type { Metadata } from "next";
import { AuthLayout, LoginForm } from "@/components/auth";
import { LoginHero } from "@/components/auth/login-hero";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to PetroTrade Customer Portal",
};

export default function LoginPage() {
  return (
    <AuthLayout
      backgroundImage="/assets/images/auth-industrial-day.jpg"
      side={<LoginHero />}
    >
      <LoginForm />
    </AuthLayout>
  );
}
