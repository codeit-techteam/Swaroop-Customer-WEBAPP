"use client";

import { AccountManagerCard } from "./AccountManagerCard";
import { FaqSection } from "./FaqSection";
import { SupportCategoryCards } from "./SupportCategoryCards";
import { SupportNotificationsPanel } from "./SupportNotificationsPanel";
import { SupportPageHeader } from "./SupportPageHeader";
import { SupportLoadingSkeleton } from "./SupportModuleShell";
import { SupportStatusWidgets } from "./SupportStatusWidgets";
import { useSupportStore } from "@/store/supportStore";

export function SupportOverviewPage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);

  if (!isHydrated) return <SupportLoadingSkeleton />;

  return (
    <div className="space-y-6">
      <SupportPageHeader />
      <SupportStatusWidgets />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <SupportCategoryCards />
          <FaqSection limit={8} />
        </div>
        <div className="space-y-4">
          <AccountManagerCard />
          <SupportNotificationsPanel />
        </div>
      </div>
    </div>
  );
}
