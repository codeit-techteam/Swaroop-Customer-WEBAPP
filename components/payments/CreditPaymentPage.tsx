"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Download, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/constants";
import { paymentsDetailPath } from "@/constants/payments";
import { formatDateDdMmYyyy, formatInr } from "@/lib/format";
import {
  computeCredit15Summary,
  computeCredit30Summary,
} from "@/mock/payments-catalog";
import {
  filterSortPayments,
  usePaymentsCatalogStore,
} from "@/store/paymentsCatalogStore";
import { PaymentStatusChip } from "./PaymentStatusChip";

interface CreditPageProps {
  mode: "credit_15" | "credit_30";
}

export function CreditPaymentPage({ mode }: CreditPageProps) {
  const router = useRouter();
  const payments = usePaymentsCatalogStore((s) => s.payments);
  const payCredit = usePaymentsCatalogStore((s) => s.payCredit);
  const isHydrated = usePaymentsCatalogStore((s) => s.isHydrated);

  useEffect(() => {
    const finish = () => usePaymentsCatalogStore.getState().setHydrated(true);
    const unsub = usePaymentsCatalogStore.persist.onFinishHydration(finish);
    if (usePaymentsCatalogStore.persist.hasHydrated()) finish();
    return unsub;
  }, []);

  const summary = useMemo(
    () =>
      mode === "credit_15"
        ? computeCredit15Summary(payments)
        : computeCredit30Summary(payments),
    [mode, payments],
  );

  const list = useMemo(
    () =>
      filterSortPayments(
        payments,
        {
          search: "",
          status: "all",
          paymentType: "all",
          warehouse: "all",
          seller: "all",
          dateFrom: "",
          dateTo: "",
          sortBy: "dueDate",
          sortDir: "asc",
        },
        mode,
      ),
    [payments, mode],
  );

  const title = mode === "credit_15" ? "Credit 15 Days" : "Credit 30 Days";

  if (!isHydrated) {
    return (
      <PageContainer>
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={
          mode === "credit_15"
            ? "Net-15 credit dashboard with outstanding balances and due dates."
            : "Net-30 credit utilization, billing cycle, and settlement history."
        }
        breadcrumbs={[
          { label: "Payments", href: ROUTES.payments },
          { label: title },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Available Credit"
          value={formatInr(summary.availableCredit, { compact: true })}
        />
        <Kpi
          label="Used Credit"
          value={formatInr(summary.usedCredit, { compact: true })}
        />
        <Kpi
          label="Credit Limit"
          value={formatInr(summary.creditLimit, { compact: true })}
        />
        <Kpi
          label="Outstanding"
          value={formatInr(summary.outstanding, { compact: true })}
        />
      </div>

      <Card className="border-slate-200 shadow-card">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-medium text-slate-700">
              Credit Utilization · {summary.utilizationPercent}%
            </span>
            {summary.paymentDueDate ? (
              <span className="text-slate-500">
                Next due {formatDateDdMmYyyy(summary.paymentDueDate)}
                {summary.countdownDays != null
                  ? ` · ${summary.countdownDays} days remaining`
                  : ""}
              </span>
            ) : null}
            {mode === "credit_30" && summary.nextBillingCycle ? (
              <span className="text-slate-500">
                Next billing cycle{" "}
                {formatDateDdMmYyyy(summary.nextBillingCycle)}
              </span>
            ) : null}
          </div>
          <Progress value={summary.utilizationPercent} className="h-2.5" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((p) => {
          const canPay = ["pending", "overdue"].includes(p.status);
          return (
            <Card key={p.id} className="border-slate-200 shadow-card">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{p.orderNumber}</CardTitle>
                  <p className="text-xs text-slate-500">
                    {p.product} · {p.seller}
                  </p>
                </div>
                <PaymentStatusChip status={p.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Meta
                    label="Outstanding"
                    value={formatInr(p.remainingBalance)}
                  />
                  <Meta
                    label="Interest"
                    value={p.interest ? formatInr(p.interest) : "—"}
                  />
                  <Meta
                    label="Due Date"
                    value={formatDateDdMmYyyy(p.dueDate)}
                  />
                  <Meta label="Warehouse" value={p.warehouse} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {canPay ? (
                    <Button
                      className="rounded-xl bg-brand hover:bg-brand-700"
                      onClick={() => {
                        payCredit(p.id);
                        toast.success("Credit payment settled");
                      }}
                    >
                      <IndianRupee className="h-4 w-4" />
                      Pay Credit
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => toast.success("Statement download started")}
                  >
                    <Download className="h-4 w-4" />
                    Download Statement
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => router.push(paymentsDetailPath(p.id))}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-slate-200 shadow-card">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
