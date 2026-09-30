"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import {
  SIDEBAR_PAD_COLLAPSED,
  SIDEBAR_PAD_EXPANDED,
} from "@/components/layout/sidebar";
import { CustomerFooter } from "@/components/layout/customer-footer";
import { CustomerSidebar } from "@/components/navigation/customer-sidebar";
import { CustomerTopNav } from "@/components/navigation/customer-top-nav";
import { KycAttentionBanner } from "@/components/kyc/KycAttentionBanner";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

interface CustomerAppShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * Desktop customer chrome — AppShell + collapsible sidebar + top nav + footer.
 * Used by all customer modules except auth and onboarding wizard.
 */
export function CustomerAppShell({
  children,
  className,
}: CustomerAppShellProps) {
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const sidebarMobileOpen = useUiStore((s) => s.sidebarMobileOpen);
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);

  return (
    <OnboardingGate>
      <AppShell
        className={cn("bg-slate-50", className)}
        sidebar={<CustomerSidebar />}
        navbar={<CustomerTopNav />}
        contentClassName={cn(
          "transition-[padding-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          sidebarCollapsed ? SIDEBAR_PAD_COLLAPSED : SIDEBAR_PAD_EXPANDED,
        )}
      >
        <div className="flex min-h-[calc(100dvh-4rem)] min-w-0 flex-1 flex-col">
          <div className="min-w-0 flex-1 px-4 py-5 md:px-6 md:py-6">
            <KycAttentionBanner />
            {children}
          </div>
          <CustomerFooter />
        </div>
      </AppShell>

      <AnimatePresence>
        {sidebarMobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-50 bg-brand/50 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,88vw)] flex-col overflow-hidden bg-brand shadow-[8px_0_40px_rgba(11,46,89,0.35)] md:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              aria-label="Mobile navigation"
            >
              <CustomerSidebar
                forceExpanded
                className="flex w-full border-r-0"
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </OnboardingGate>
  );
}
