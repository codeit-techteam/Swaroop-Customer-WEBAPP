"use client";

import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/notification-time";
import {
  getNotificationActionLabel,
  getNotificationHref,
  getNotificationReference,
  resolveNotificationActionType,
} from "@/lib/notification-actions";
import type { AppNotification } from "@/types/notifications";
import { Button } from "@/components/ui/button";
import { NotificationTypeIcon } from "./NotificationBadges";

interface NotificationFeedItemProps {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
  onAction: (notification: AppNotification) => void;
}

export function NotificationFeedItem({
  notification,
  onOpen,
  onAction,
}: NotificationFeedItemProps) {
  const isUnread = notification.status === "unread";
  const actionType = resolveNotificationActionType(notification);
  const actionLabel = getNotificationActionLabel(
    actionType,
    notification.category,
  );
  const reference = getNotificationReference(notification);
  const href = getNotificationHref(notification);

  const handleAction = (e: MouseEvent) => {
    e.stopPropagation();
    onAction(notification);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(notification)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(notification);
        }
      }}
      className={cn(
        "group w-full rounded-xl border p-3.5 text-left transition-colors duration-200",
        "hover:border-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        isUnread
          ? "border-sky-200/80 bg-sky-50/50"
          : "border-slate-200 bg-white",
      )}
    >
      <div className="flex gap-3">
        <NotificationTypeIcon
          type={notification.type}
          category={notification.category}
          priority={notification.priority}
          className="!h-10 !w-10 rounded-lg"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <h3
                className={cn(
                  "truncate text-sm text-slate-900",
                  isUnread ? "font-semibold" : "font-medium",
                )}
              >
                {notification.title}
              </h3>
              {isUnread ? (
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-accent-blue transition-opacity duration-200"
                  aria-label="Unread"
                />
              ) : null}
            </div>
            <time className="shrink-0 text-[11px] font-medium text-slate-400">
              {formatRelativeTime(notification.createdAt)}
            </time>
          </div>

          {reference ? (
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">
              {reference}
            </p>
          ) : null}

          <p className="mt-1 line-clamp-2 text-sm leading-snug text-slate-600">
            {notification.description}
          </p>

          <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 rounded-lg border-slate-200 px-2.5 text-xs font-semibold text-brand hover:bg-brand/5 hover:text-brand"
              onClick={handleAction}
              aria-label={`${actionLabel} — ${href}`}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
