"use client";

import { Bell, CheckCircle2, FileText, Ticket, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupportStore } from "@/store/supportStore";
import { formatRelativeTime } from "./support-format";
import type { SupportActivityType } from "@/types/support";
import { cn } from "@/lib/utils";

const ICON_BY_TYPE: Record<
  SupportActivityType,
  { icon: typeof Ticket; tone: string }
> = {
  ticket_assigned: { icon: Ticket, tone: "bg-sky-50 text-sky-700" },
  payment_verified: {
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-700",
  },
  shipment_updated: { icon: Truck, tone: "bg-orange-50 text-orange-700" },
  invoice_generated: { icon: FileText, tone: "bg-violet-50 text-violet-700" },
  ticket_replied: { icon: Bell, tone: "bg-amber-50 text-amber-700" },
  credit_updated: { icon: CheckCircle2, tone: "bg-blue-50 text-blue-700" },
};

export function SupportNotificationsPanel() {
  const activities = useSupportStore((s) => s.activities);
  const markActivityRead = useSupportStore((s) => s.markActivityRead);
  const markAllActivitiesRead = useSupportStore((s) => s.markAllActivitiesRead);
  const unread = activities.filter((a) => !a.read).length;

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold text-brand">
            Recent Support Activity
          </CardTitle>
          {unread > 0 ? (
            <p className="mt-0.5 text-xs text-slate-400">
              {unread} unread notification{unread === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-accent-blue"
          onClick={markAllActivitiesRead}
        >
          Mark all read
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.slice(0, 6).map((item) => {
          const meta = ICON_BY_TYPE[item.type];
          const Icon = meta.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => markActivityRead(item.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                !item.read && "bg-sky-50/60",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  meta.tone,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                  {!item.read ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-blue" />
                  ) : null}
                </div>
                <p className="truncate text-xs text-slate-500">
                  {item.description}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {formatRelativeTime(item.at)}
                </p>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
