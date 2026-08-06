"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { RaiseTicketDialog } from "./RaiseTicketDialog";
import { ChatSupportModal } from "./ChatSupportModal";
import { TicketViewModal } from "./TicketViewModal";
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
    <div className="-mx-4 -my-5 min-h-[calc(100vh-7.5rem)] bg-white md:-mx-6 md:-my-6 md:min-h-[calc(100vh-8rem)]">
      <div className="px-4 py-6 md:px-8 md:py-8">{children}</div>
      <RaiseTicketDialog />
      <ChatSupportModal />
      <TicketViewModal />
    </div>
  );
}

export function SupportLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
