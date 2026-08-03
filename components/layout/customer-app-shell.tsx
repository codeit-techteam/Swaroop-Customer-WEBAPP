"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { CustomerFooter } from "@/components/layout/customer-footer";
import { CustomerSidebar } from "@/components/navigation/customer-sidebar";
import { CustomerTopNav } from "@/components/navigation/customer-top-nav";
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
  const sidebarMobileOpen = useUiStore((s) => s.sidebarMobileOpen);
  const setSidebarMobileOpen = useUiStore((s) => s.setSidebarMobileOpen);

  return (
    <>
      <AppShell
        className={cn("bg-slate-50", className)}
        sidebar={<CustomerSidebar />}
        navbar={<CustomerTopNav />}
      >
        <div className="flex min-h-full flex-1 flex-col">
          <div className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</div>
          <CustomerFooter />
        </div>
      </AppShell>

      <AnimatePresence>
        {sidebarMobileOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="fixed inset-0 z-50 bg-slate-900/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white shadow-panel md:hidden"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
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
    </>
  );
}
