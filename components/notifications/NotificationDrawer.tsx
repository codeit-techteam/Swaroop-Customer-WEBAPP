"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotificationHref } from "@/lib/notification-actions";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notificationStore";
import {
  getMvpFeedNotifications,
  getUnreadCount,
  useNotificationsCatalogStore,
} from "@/store/notificationsCatalogStore";
import type { AppNotification } from "@/types/notifications";
import { NotificationFeedItem } from "./NotificationFeedItem";

const PAGE_SIZE = 10;

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDrawer({
  open,
  onOpenChange,
}: NotificationDrawerProps) {
  const router = useRouter();
  const notifications = useNotificationsCatalogStore((s) => s.notifications);
  const markRead = useNotificationsCatalogStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const setHydrated = useNotificationsCatalogStore((s) => s.setHydrated);
  const isHydrated = useNotificationsCatalogStore((s) => s.isHydrated);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub =
      useNotificationsCatalogStore.persist.onFinishHydration(finish);
    if (useNotificationsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, [setHydrated]);

  useEffect(() => {
    if (open) setVisibleCount(PAGE_SIZE);
  }, [open]);

  const feed = getMvpFeedNotifications(notifications);
  const unreadCount = getUnreadCount(notifications);
  const visible = feed.slice(0, visibleCount);
  const hasMore = visibleCount < feed.length;

  const navigateTo = (notification: AppNotification) => {
    if (notification.status === "unread") markRead(notification.id);
    onOpenChange(false);
    // Allow drawer close animation before route change
    window.setTimeout(() => {
      router.push(getNotificationHref(notification));
    }, 180);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[420px]"
      >
        <SheetHeader className="space-y-0 border-b border-slate-200 px-5 py-4 text-left">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle className="text-lg font-semibold text-slate-900">
                Notifications
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-sm text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} Unread`
                  : "You're all caught up"}
              </SheetDescription>
            </div>
            {unreadCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 rounded-lg text-xs font-semibold text-brand hover:bg-brand/5 hover:text-brand"
                onClick={() => markAllRead()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            ) : null}
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2.5 px-4 py-4">
            {!isHydrated ? (
              <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[88px] animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <EmptyFeed />
            ) : (
              <>
                {visible.map((n) => (
                  <NotificationFeedItem
                    key={n.id}
                    notification={n}
                    onOpen={navigateTo}
                    onAction={navigateTo}
                  />
                ))}

                {hasMore ? (
                  <div className="pb-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 w-full rounded-xl border-slate-200 text-sm font-semibold text-slate-700"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    >
                      Load Older Notifications
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function EmptyFeed() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Bell className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-slate-900">
        You&apos;re all caught up
      </h3>
      <p className="mt-1 text-sm text-slate-500">No new notifications.</p>
    </div>
  );
}
