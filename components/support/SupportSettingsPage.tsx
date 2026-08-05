"use client";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSupportStore } from "@/store/supportStore";
import { SupportPageHeader } from "./SupportPageHeader";
import { SupportLoadingSkeleton } from "./SupportModuleShell";

export function SupportSettingsPage() {
  const isHydrated = useSupportStore((s) => s.isHydrated);
  const preferences = useSupportStore((s) => s.preferences);
  const setPreferences = useSupportStore((s) => s.setPreferences);

  if (!isHydrated) return <SupportLoadingSkeleton />;

  function toggle(key: keyof typeof preferences, label: string, next: boolean) {
    setPreferences({ [key]: next });
    toast.success(`${label} ${next ? "enabled" : "disabled"}`);
  }

  const rows: Array<{
    key: keyof typeof preferences;
    label: string;
    description: string;
  }> = [
    {
      key: "emailAlerts",
      label: "Email alerts",
      description: "Ticket updates and SLA reminders to your registered email.",
    },
    {
      key: "smsAlerts",
      label: "SMS alerts",
      description: "Critical ticket and shipment diversion SMS notifications.",
    },
    {
      key: "ticketUpdates",
      label: "In-app ticket updates",
      description: "Show support activity notifications inside the portal.",
    },
    {
      key: "chatSound",
      label: "Live chat sound",
      description: "Play a subtle tone when the executive replies.",
    },
  ];

  return (
    <div className="space-y-6">
      <SupportPageHeader
        title="Support Settings"
        subtitle="Manage how you receive Support Center notifications."
        hideSearch
      />

      <Card className="max-w-2xl rounded-2xl border-slate-200/80 shadow-card">
        <CardHeader>
          <CardTitle className="text-base text-brand">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <Label htmlFor={row.key} className="text-sm font-semibold">
                  {row.label}
                </Label>
                <p className="text-xs text-slate-500">{row.description}</p>
              </div>
              <Switch
                id={row.key}
                checked={preferences[row.key]}
                onCheckedChange={(v) => toggle(row.key, row.label, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
