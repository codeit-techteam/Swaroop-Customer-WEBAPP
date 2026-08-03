"use client";

import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateDdMmYyyy } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DocumentTimelineEvent } from "@/types/documents";

interface DocumentTimelineProps {
  events: DocumentTimelineEvent[];
  title?: string;
  className?: string;
}

export function DocumentTimeline({
  events,
  title = "Document Timeline",
  className,
}: DocumentTimelineProps) {
  return (
    <Card className={cn("border-slate-200 shadow-card", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative ml-3 space-y-0 border-l border-slate-200">
          {events.map((event) => {
            const Icon =
              event.status === "completed"
                ? CheckCircle2
                : event.status === "current"
                  ? CircleDot
                  : Circle;
            return (
              <li key={event.id} className="relative pb-5 pl-6 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[9px] top-0.5 rounded-full bg-white",
                    event.status === "completed" && "text-emerald-600",
                    event.status === "current" && "text-brand",
                    event.status === "upcoming" && "text-slate-300",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    event.status === "upcoming"
                      ? "text-slate-400"
                      : "text-slate-900",
                  )}
                >
                  {event.label}
                </p>
                {event.description ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {event.description}
                  </p>
                ) : null}
                {event.status !== "upcoming" ? (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateDdMmYyyy(event.at)}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
