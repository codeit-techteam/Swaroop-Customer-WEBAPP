"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { SupportSidebar } from "./SupportSidebar";
import { SupportFooter } from "./SupportFooter";
import { RaiseTicketDialog } from "./RaiseTicketDialog";
import { TicketDetailsDrawer } from "./TicketDetailsDrawer";
import { SupportDocPreviewModal } from "./SupportDocPreviewModal";
import { useSupportStore } from "@/store/supportStore";
import { Skeleton } from "@/components/ui/skeleton";

export function SupportModuleShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const finish = () => useSupportStore.getState().setHydrated(true);
    const unsub = useSupportStore.persist.onFinishHydration(finish);
    if (useSupportStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  return (
    <div className="-mx-4 -my-5 flex min-h-[calc(100vh-7.5rem)] overflow-hidden rounded-none border-y border-slate-200 bg-white md:-mx-6 md:-my-6 md:min-h-[calc(100vh-8rem)] md:rounded-tl-2xl md:border md:border-slate-200 md:shadow-card">
      <SupportSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50/80">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">{children}</div>
        <SupportFooter />
      </div>
      <RaiseTicketDialog />
      <TicketDetailsDrawer />
      <SupportDocPreviewModal />
    </div>
  );
}

export function SupportLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-80 rounded-xl" />
      <Skeleton className="h-4 w-96 rounded-lg" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  );
}
