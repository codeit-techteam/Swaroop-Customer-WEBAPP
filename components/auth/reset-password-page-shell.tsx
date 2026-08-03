"use client";

import { CircleHelp, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Logo } from "@/components/auth";
import { EnterpriseFooter } from "@/components/auth/enterprise-footer";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { ResetPasswordHero } from "@/components/auth/reset-password-hero";
import { ROUTES } from "@/constants";

/**
 * Reset password shell: header + centered split card + enterprise footer.
 */
export function ResetPasswordPageShell() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F5F8]">
      <header className="flex items-center justify-between bg-white px-5 py-3.5 shadow-sm sm:px-8">
        <Logo variant="dark" size="sm" href={ROUTES.login} />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Help"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            <CircleHelp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Language"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            <Globe className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-panel"
        >
          <aside className="relative hidden w-[42%] shrink-0 flex-col overflow-hidden lg:flex">
            <Image
              src="/assets/images/auth-industrial-night.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="42vw"
            />
            <div className="absolute inset-0 bg-brand/90" />
            <div className="relative z-10 flex h-full min-h-[520px] flex-col p-10 text-white">
              <ResetPasswordHero />
            </div>
          </aside>
          <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
            <ResetPasswordForm />
          </div>
        </motion.div>
      </div>

      <EnterpriseFooter />
    </div>
  );
}
