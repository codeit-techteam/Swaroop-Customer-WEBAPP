import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageFooterProps {
  className?: string;
}

export function PageFooter({ className }: PageFooterProps) {
  return (
    <footer
      className={cn(
        "flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8",
        className,
      )}
      role="contentinfo"
    >
      <p className="text-xs text-slate-500">
        © PetroTrade Industrial Solutions. All rights reserved.
      </p>
      <nav
        className="flex flex-wrap items-center gap-4 text-xs text-slate-500"
        aria-label="Legal"
      >
        <Link
          href="#"
          className="transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          Privacy Policy
        </Link>
        <Link
          href="#"
          className="transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          Terms of Service
        </Link>
        <Link
          href="#"
          className="transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          Security Whitepaper
        </Link>
      </nav>
    </footer>
  );
}
