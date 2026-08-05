"use client";

import { AccountManagerCard } from "./AccountManagerCard";
import { SupportNotificationsPanel } from "./SupportNotificationsPanel";
import { SupportPageHeader } from "./SupportPageHeader";
import { SupportLoadingSkeleton } from "./SupportModuleShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupportStore } from "@/store/supportStore";
import { SUPPORT_SLA_COPY } from "@/constants/support";

export function SupportAccountManagerPage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);
  const manager = useSupportStore((s) => s.accountManager);

  if (!isHydrated) return <SupportLoadingSkeleton />;

  return (
    <div className="space-y-6">
      <SupportPageHeader
        title="Account Manager"
        subtitle="Your dedicated PetroTrade relationship desk for commercial, credit and escalation needs."
        hideSearch
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AccountManagerCard />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Card className="rounded-2xl border-slate-200/80 shadow-card">
            <CardHeader>
              <CardTitle className="text-base text-brand">
                How {manager.name.split(" ")[0]} can help
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                "Credit limit reviews and temporary extensions",
                "Supply network negotiation for strategic offtake",
                "Payment / UTR escalations beyond SLA",
                "Logistics redirection and demurrage disputes",
                "Quality claim coordination with warehouses",
                "Onboarding additional plant shipping addresses",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-600"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 shadow-card">
            <CardHeader>
              <CardTitle className="text-base text-brand">
                Engagement guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm leading-relaxed text-slate-600">
              <p>{SUPPORT_SLA_COPY}</p>
              <p>
                For Critical logistics issues outside business hours, use Live
                Chat or raise a Critical ticket — the night desk will loop{" "}
                {manager.name} on the next business morning.
              </p>
              <p className="text-xs text-slate-400">
                Department: {manager.department} · {manager.location}
              </p>
            </CardContent>
          </Card>

          <SupportNotificationsPanel />
        </div>
      </div>
    </div>
  );
}
