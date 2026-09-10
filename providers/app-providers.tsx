"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { CxFeedHydrator } from "@/components/cx-feed-hydrator";
import { AdminPushHydrator } from "@/components/admin-push-hydrator";
import { ToastProvider } from "@/components/common/toast-provider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        {children}
        <CxFeedHydrator />
        <AdminPushHydrator />
        <ToastProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}
