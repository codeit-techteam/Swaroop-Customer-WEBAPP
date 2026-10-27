"use client";

import { cn } from "@/lib/utils";
import { APP_SHORT_NAME } from "@/constants";
import {
  openContactSupport,
  openPrivacyPolicy,
  openTermsOfService,
} from "@/lib/legal-links";

type FooterAction = {
  label: string;
  onClick: () => void;
};

interface EnterpriseFooterProps {
  copyright?: string;
  className?: string;
  variant?: "bar" | "inline";
  showBrandPrefix?: boolean;
}

const ACTIONS: FooterAction[] = [
  { label: "Terms of Service", onClick: () => void openTermsOfService() },
  { label: "Privacy Policy", onClick: () => void openPrivacyPolicy() },
  { label: "Contact Support", onClick: () => void openContactSupport() },
];

function ActionButtons({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Legal"
      className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
    >
      {ACTIONS.map((link) => (
        <button
          key={link.label}
          type="button"
          onClick={link.onClick}
          className="text-xs text-muted-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}

export function EnterpriseFooter({
  copyright = "© PolyStoreX Solutions. Institutional Security Guaranteed.",
  className,
  variant = "bar",
  showBrandPrefix = false,
}: EnterpriseFooterProps) {
  const copy = showBrandPrefix ? `${APP_SHORT_NAME} | ${copyright}` : copyright;

  if (variant === "inline") {
    return (
      <footer
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground",
          className,
        )}
      >
        <span>{copy}</span>
        <ActionButtons />
      </footer>
    );
  }

  return (
    <footer
      className={cn(
        "flex w-full flex-col gap-3 border-t border-border/70 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">{copy}</p>
      <ActionButtons />
    </footer>
  );
}
