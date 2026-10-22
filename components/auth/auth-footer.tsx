"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
  openContactSupport,
  openPrivacyPolicy,
  openTermsOfService,
} from "@/lib/legal-links";

type AuthFooterAction = {
  label: string;
  onClick: () => void;
};

interface AuthFooterProps {
  className?: string;
}

const ACTIONS: AuthFooterAction[] = [
  { label: "Privacy Policy", onClick: () => void openPrivacyPolicy() },
  { label: "Terms of Service", onClick: () => void openTermsOfService() },
  { label: "Support Center", onClick: () => void openContactSupport() },
];

export function AuthFooter({ className }: AuthFooterProps) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = useCallback(
    async (label: string, action: () => void | Promise<void>) => {
      if (busy) return;
      setBusy(label);
      try {
        await action();
      } finally {
        setBusy(null);
      }
    },
    [busy],
  );

  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {ACTIONS.map((link) => (
        <button
          key={link.label}
          type="button"
          disabled={busy !== null}
          onClick={() => void run(link.label, link.onClick)}
          className="transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:opacity-60"
        >
          {busy === link.label ? "Opening…" : link.label}
        </button>
      ))}
    </footer>
  );
}
