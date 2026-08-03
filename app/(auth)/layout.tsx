import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | PetroTrade",
    default: "Authentication",
  },
};

/**
 * Auth route group — full-bleed screens without AppShell chrome.
 */
export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {children}
    </div>
  );
}
