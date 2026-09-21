"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PaymentsPageSkeleton } from "./payments-page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { paymentsDetailPath } from "@/constants/payments";
import { formatDateDdMmYyyy } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePaymentsCatalogStore } from "@/store/paymentsCatalogStore";

export function PaymentNotificationsPage() {
  const router = useRouter();
  const notifications = usePaymentsCatalogStore((s) => s.notifications);
  const markNotificationRead = usePaymentsCatalogStore(
    (s) => s.markNotificationRead,
  );
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  if (!isHydrated) {
    return (
      <PageContainer>
        <PaymentsPageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Payment Notifications"
        description="Advance due reminders, verification updates, invoices, and receipts."
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: "Notifications" },
        ]}
      />

      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => {
              markNotificationRead(n.id);
              if (n.paymentId) router.push(paymentsDetailPath(n.paymentId));
            }}
            className={cn(
              "w-full rounded-2xl border px-4 py-3 text-left transition hover:border-brand/30",
              n.read
                ? "border-slate-200 bg-white"
                : "border-brand/20 bg-brand/[0.03]",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-brand/5 p-2 text-brand">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  {!n.read ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDateDdMmYyyy(n.createdAt)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-slate-500">
            No payment notifications yet.
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
