"use client";

import { motion } from "framer-motion";
import { OnboardingTopNav } from "@/components/onboarding/OnboardingTopNav";
import { OnboardingSidebar } from "@/components/onboarding/OnboardingSidebar";
import { PageFooter } from "@/components/onboarding/PageFooter";
import { cn } from "@/lib/utils";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  saveDraftVariant?: "outline" | "link" | "solid";
  helpVariant?: "card" | "button" | "support";
  className?: string;
  contentClassName?: string;
}

export function OnboardingLayout({
  children,
  saveDraftVariant = "outline",
  helpVariant = "card",
  className,
  contentClassName,
}: OnboardingLayoutProps) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-slate-50", className)}>
      <OnboardingTopNav saveDraftVariant={saveDraftVariant} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Mobile step strip */}
        <div className="border-b border-slate-200 lg:hidden">
          <OnboardingSidebar
            helpVariant="button"
            className="max-h-[40vh] overflow-y-auto border-r-0"
          />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <OnboardingSidebar helpVariant={helpVariant} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <motion.main
            className={cn(
              "flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
              contentClassName,
            )}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            id="onboarding-main"
          >
            {children}
          </motion.main>
          <PageFooter />
        </div>
      </div>
    </div>
  );
}
