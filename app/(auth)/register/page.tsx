import type { Metadata } from "next";
import { AuthLayout, RegisterForm } from "@/components/auth";
import { RegisterHero } from "@/components/auth/register-hero";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your PetroTrade corporate account",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      backgroundImage="/assets/images/auth-industrial-night.jpg"
      side={<RegisterHero />}
      sideClassName="lg:w-[42%] xl:w-[42%]"
      contentClassName="bg-[#F3F5F8]"
    >
      <div className="flex w-full flex-col items-center justify-center py-4">
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
