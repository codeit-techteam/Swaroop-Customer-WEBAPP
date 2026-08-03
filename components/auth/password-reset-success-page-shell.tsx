"use client";

import Image from "next/image";
import { EnterpriseFooter } from "@/components/auth/enterprise-footer";
import { PasswordResetSuccessContent } from "@/components/auth/password-reset-success-content";
import { PasswordResetSuccessHero } from "@/components/auth/password-reset-success-hero";

export function PasswordResetSuccessPageShell() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="relative hidden min-h-[280px] w-full overflow-hidden lg:block lg:w-1/2">
          <Image
            src="/assets/images/auth-industrial-night.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="50vw"
          />
          <div className="via-brand/88 absolute inset-0 bg-gradient-to-br from-brand/95 to-brand/80" />
          <div className="relative z-10 flex h-full min-h-[560px] flex-col p-10 text-white xl:p-14">
            <PasswordResetSuccessHero />
          </div>
        </aside>

        <main className="flex w-full flex-1 flex-col items-center justify-center px-5 py-12 sm:px-10 lg:w-1/2">
          <PasswordResetSuccessContent />
        </main>
      </div>

      <EnterpriseFooter
        showBrandPrefix
        links={[
          { label: "Terms of Service", href: "#" },
          { label: "Privacy Policy", href: "#" },
          { label: "Security Protocol", href: "#" },
        ]}
      />
    </div>
  );
}
