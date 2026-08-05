"use client";

import Link from "next/link";

export function SupportFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-100/80 px-4 py-3.5 md:px-6">
      <div className="flex flex-col gap-3 text-xs text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-semibold text-brand">
            PetroTrade Enterprise
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            System Status: Operational
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 font-medium">
          <Link href="#" className="hover:text-brand">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-brand">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-brand">
            Security Audit
          </Link>
        </nav>
        <p className="text-slate-400">
          © {year} PetroTrade Support Center. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
