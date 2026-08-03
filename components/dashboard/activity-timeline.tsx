"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Send,
  Truck,
  TrendingUp,
} from "lucide-react";
import type { ActivityItem, ActivityType } from "@/types/dashboard";
import { ROUTES } from "@/constants";
import { SectionTitle } from "@/components/dashboard/section-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  items: ActivityItem[];
  className?: string;
}

const ACTIVITY_ICON: Record<
  ActivityType,
  { icon: typeof Truck; tone: string }
> = {
  shipment_update: {
    icon: Truck,
    tone: "bg-emerald-100 text-emerald-600",
  },
  seller_approved: {
    icon: CheckCircle2,
    tone: "bg-sky-100 text-sky-600",
  },
  payment_reminder: {
    icon: AlertCircle,
    tone: "bg-red-100 text-red-500",
  },
  document_available: {
    icon: FileText,
    tone: "bg-indigo-100 text-indigo-600",
  },
  purchase_request_submitted: {
    icon: Send,
    tone: "bg-brand/10 text-brand",
  },
  price_alert: {
    icon: TrendingUp,
    tone: "bg-amber-100 text-amber-600",
  },
};

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  const visible = items.slice(0, 3);

  return (
    <Card className={cn("border-slate-200/80", className)}>
      <CardHeader className="pb-3">
        <SectionTitle
          title="Recent Activity"
          actionLabel="View all"
          actionHref={ROUTES.notifications}
        />
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="space-y-1">
          {visible.map((item, index) => {
            const config = ACTIVITY_ICON[item.type];
            const Icon = config.icon;
            const isLast = index === visible.length - 1;
            const content = (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="flex gap-3 rounded-xl p-2 transition-colors"
              >
                <div className="flex flex-col items-center pt-0.5">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      config.tone,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {!isLast ? (
                    <span
                      className="mt-1 min-h-[12px] w-px flex-1 bg-slate-200"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pb-2">
                  <p className="text-[13px] font-medium leading-snug text-slate-800">
                    {item.description}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.relativeTime}
                  </p>
                </div>
              </motion.div>
            );

            if (item.href) {
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="block rounded-xl hover:bg-slate-50"
                  >
                    {content}
                  </Link>
                </li>
              );
            }

            return <li key={item.id}>{content}</li>;
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
