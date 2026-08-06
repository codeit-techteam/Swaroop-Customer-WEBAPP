"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { APP_SHORT_NAME } from "@/constants";

interface FooterLink {
  label: string;
  href: string;
}

interface EnterpriseFooterProps {
  copyright?: string;
  links?: FooterLink[];
  className?: string;
  variant?: "bar" | "inline";
  showBrandPrefix?: boolean;
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Security Protocol", href: "#" },
  { label: "Contact Support", href: "#" },
];

export function EnterpriseFooter({
  copyright = "© PetroTrade Solutions. Institutional Security Guaranteed.",
  links = DEFAULT_LINKS,
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
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            {link.label}
          </Link>
        ))}
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
      <nav
        aria-label="Legal"
        className="flex flex-wrap items-center gap-x-5 gap-y-2"
      >
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-xs text-muted-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
