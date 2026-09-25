"use client";

import { ContactInfoCard } from "./ContactInfoCard";
import { FloatingChatWidget } from "./FloatingChatWidget";
import { RecentTicketsTable } from "./RecentTicketsTable";
import { SupportContactCards } from "./SupportContactCards";
import { SupportLoadingSkeleton } from "./SupportModuleShell";
import { useSupportStore } from "@/store/supportStore";

export function HelpCenterPage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);
  const isLoading = useSupportStore((s) => s.isLoading);
  const loadError = useSupportStore((s) => s.loadError);
  const loadTickets = useSupportStore((s) => s.loadTickets);

  if (!isHydrated || isLoading) return <SupportLoadingSkeleton />;

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand md:text-3xl">
            Help &amp; Support
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
            Need help with your orders, payments, shipment or account? Our
            PetroTrade support team is here to help.
          </p>
        </header>

        {loadError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}{" "}
            <button
              type="button"
              className="font-semibold underline"
              onClick={() => void loadTickets()}
            >
              Retry
            </button>
          </div>
        ) : null}

        <SupportContactCards />
        <RecentTicketsTable />
        <ContactInfoCard />
      </div>

      <FloatingChatWidget />
    </>
  );
}
