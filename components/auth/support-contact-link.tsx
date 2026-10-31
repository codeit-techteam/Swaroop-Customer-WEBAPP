"use client";

import { useEffect, useState } from "react";
import { fetchLegalLinks, openContactSupport } from "@/lib/legal-links";
import { cn } from "@/lib/utils";

/**
 * Never hardcode a support mailbox. Prefer PUBLIC_SUPPORT_EMAIL from the API;
 * otherwise open the configured support page.
 */
export function SupportContactLink({
  className,
  children = "Contact support",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchLegalLinks().then((links) => {
      if (active) setEmail(links.supportEmail);
    });
    return () => {
      active = false;
    };
  }, []);

  if (email) {
    return (
      <a href={`mailto:${email}`} className={cn(className)}>
        {typeof children === "string" && children === "Contact support"
          ? email
          : children}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void openContactSupport()}
      className={cn(className)}
    >
      {children}
    </button>
  );
}
