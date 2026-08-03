"use client";

import Link from "next/link";
import { CircleHelp, Globe } from "lucide-react";
import { Logo } from "@/components/auth";
import { AuthIllustration } from "@/components/auth/auth-illustration";
import { ForgotOtpHero } from "@/components/auth/forgot-otp-hero";
import { OtpVerificationCard } from "@/components/auth/otp-verification-card";
import { APP_SHORT_NAME, ROUTES } from "@/constants";

const NAV_LINKS = [
  { label: "Markets", href: "#" },
  { label: "Logistics", href: "#" },
  { label: "Contact Support", href: "#" },
] as const;

/**
 * Full-page OTP verification shell matching the enterprise design:
 * top nav + split industrial panel + form panel.
 */
export function ForgotOtpPageShell() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-3">
          <Logo variant="dark" size="sm" href={ROUTES.login} />
          <span className="hidden rounded bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:inline-flex">
            Enterprise
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <nav
            aria-label="Secondary"
            className="mr-2 hidden items-center gap-5 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            aria-label="Language"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            <Globe className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Help"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            <CircleHelp className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="hidden min-h-[360px] w-full lg:block lg:w-1/2 xl:w-[52%]">
          <AuthIllustration
            backgroundImage="/assets/images/auth-industrial-day.jpg"
            className="min-h-full"
            overlayClassName="bg-brand/85"
          >
            <ForgotOtpHero />
          </AuthIllustration>
        </div>

        <main className="flex w-full flex-1 flex-col px-5 py-6 sm:px-10 lg:w-1/2 xl:w-[48%] xl:px-14">
          <OtpVerificationCard />
        </main>
      </div>

      <span className="sr-only">
        {APP_SHORT_NAME} password reset verification
      </span>
    </div>
  );
}
