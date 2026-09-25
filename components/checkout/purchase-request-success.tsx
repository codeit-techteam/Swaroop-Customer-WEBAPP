"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants";
import { formatInr, formatQuantityMt } from "@/lib/format";
import { fetchPurchaseRequestStatus } from "@/services/purchase-requests";
import { usePurchaseRequestTrackingStore } from "@/store/purchaseRequestTrackingStore";

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function isLivePurchaseRequestSuccess(
  searchParams: URLSearchParams,
): boolean {
  return Boolean(
    searchParams.get("referenceNumber") || searchParams.get("prId"),
  );
}

export function PurchaseRequestSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fetchFromApi = usePurchaseRequestTrackingStore((s) => s.fetchFromApi);
  const [now, setNow] = useState(() => Date.now());
  const [liveStatus, setLiveStatus] = useState<string | null>(
    searchParams.get("status"),
  );
  const [liveDeadline, setLiveDeadline] = useState<string | null>(
    searchParams.get("deadline"),
  );

  const referenceNumber =
    searchParams.get("referenceNumber") ?? "Request received";
  const paymentOption = searchParams.get("paymentOption") ?? "Advance";
  const quantity = searchParams.get("quantity");
  const unit = searchParams.get("unit") ?? "MT";
  const amount = searchParams.get("amount");
  const productName = searchParams.get("productName") ?? "Marketplace product";
  const prId = searchParams.get("prId");

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    void fetchFromApi();
  }, [fetchFromApi]);

  useEffect(() => {
    if (!prId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const status = await fetchPurchaseRequestStatus(prId);
        if (cancelled) return;
        setLiveStatus(status.status);
        if (status.responseDeadline) {
          setLiveDeadline(status.responseDeadline);
        }
        if (
          status.status === "EXPIRED" ||
          status.status === "CANCELLED" ||
          status.status === "REJECTED" ||
          status.status === "CONVERTED_TO_ORDER" ||
          status.status === "APPROVED" ||
          (status.remainingSeconds != null && status.remainingSeconds <= 0)
        ) {
          void fetchFromApi();
        }
      } catch {
        // Keep local countdown if status poll fails transiently.
      }
    };

    void poll();
    const id = window.setInterval(poll, 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [prId, fetchFromApi]);

  const remainingMs = useMemo(() => {
    if (!liveDeadline) return null;
    const ends = new Date(liveDeadline).getTime();
    if (!Number.isFinite(ends)) return null;
    return Math.max(0, ends - now);
  }, [liveDeadline, now]);

  const expired =
    liveStatus === "EXPIRED" || (remainingMs != null && remainingMs <= 0);
  const amountValue = amount != null && amount !== "" ? Number(amount) : null;
  const quantityValue =
    quantity != null && quantity !== "" ? Number(quantity) : null;

  return (
    <PageContainer>
      <PageHeader
        title="Purchase request submitted"
        description="Seller matching is in progress. You will see updates in Purchase Requests as the seller responds."
        breadcrumbs={[
          { label: "Checkout", href: ROUTES.checkout },
          { label: "Purchase Request" },
        ]}
      />

      <div className="mx-auto max-w-2xl space-y-4">
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 px-6 py-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="mt-4 text-[11px] font-semibold tracking-[1.2px] text-slate-400">
            PURCHASE REQUEST SUBMITTED
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {referenceNumber}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Seller matching is in progress. Track status under Purchase Requests
            while the seller responds.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-card">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-blue/10 px-3 py-1.5 text-[11px] font-semibold text-accent-blue">
            <Clock3 className="h-3.5 w-3.5" />
            {expired ? "Response window closed" : "Awaiting seller response"}
          </div>
          {remainingMs != null ? (
            <p className="text-4xl font-semibold tabular-nums text-brand">
              {formatCountdown(remainingMs)}
            </p>
          ) : (
            <p className="text-base font-semibold text-slate-800">
              Sellers typically respond within 15 minutes
            </p>
          )}
          <p className="mt-3 text-sm text-slate-500">
            {expired
              ? "We will notify you if the seller responds late or the request expires."
              : "Sellers have 15 minutes to accept, reject, or counter your request."}
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-[10px] font-semibold tracking-[0.8px] text-slate-400">
            REQUEST SUMMARY
          </p>
          <h3 className="mt-2 text-[17px] font-semibold text-slate-900">
            {productName}
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full">
              {quantityValue != null
                ? formatQuantityMt(quantityValue)
                : `${quantity ?? "—"} ${unit}`}
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {paymentOption}
            </Badge>
          </div>
          {amountValue != null && Number.isFinite(amountValue) ? (
            <p className="mt-4 text-[22px] font-semibold tabular-nums text-accent-blue">
              {formatInr(amountValue, { compact: true })}
            </p>
          ) : null}
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-accent-blue/5 px-4 py-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-blue" />
            <div>
              <p className="text-[13px] font-semibold text-slate-900">
                Blind marketplace protected
              </p>
              <p className="mt-1 text-xs leading-[18px] text-slate-600">
                Seller identity stays confidential until commercial acceptance.
                PetroTrade manages matching and negotiation on your behalf.
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <Button
            className="h-11 rounded-xl bg-brand hover:bg-brand-700"
            onClick={() => router.replace(ROUTES.purchaseRequests)}
          >
            View Purchase Requests
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => router.replace(ROUTES.marketplace)}
          >
            Continue Shopping
          </Button>
          <p className="pt-1 text-center text-xs text-slate-400">
            Track response status anytime from Purchase Requests
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
