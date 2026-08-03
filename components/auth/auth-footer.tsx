"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthFooterLink {
  label: string;
  href: string;
}

interface AuthFooterProps {
  links?: AuthFooterLink[];
  className?: string;
}

const DEFAULT_LINKS: AuthFooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Support Center", href: "#" },
];

export function AuthFooter({
  links = DEFAULT_LINKS,
  className,
}: AuthFooterProps) {
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground",
        className,
      )}
    >
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
