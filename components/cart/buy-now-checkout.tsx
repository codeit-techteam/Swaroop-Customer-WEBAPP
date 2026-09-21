"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { formatInr } from "@/lib/format";
import {
  checkoutErrorMessage,
  checkoutLatestQuote,
  fetchCustomerCheckoutAddresses,
  fetchCustomerQuote,
  placeCustomerPurchaseRequest,
  type CheckoutAddress,
  type CheckoutQuote,
} from "@/services/checkout";

export function BuyNowCheckoutPage({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchCustomerQuote(quoteId), fetchCustomerCheckoutAddresses()])
      .then(([nextQuote, nextAddresses]) => {
        if (cancelled) return;
        setQuote(nextQuote);
        setAddresses(nextAddresses);
        setAddressId(nextQuote.shippingAddressId ?? nextAddresses[0]?.id ?? "");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(checkoutErrorMessage(cause, "Unable to load latest pricing"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  const rows = useMemo(() => {
    if (!quote) return [];
    const discount = Number(quote.discountAmount);
    return [
      { label: "Base Amount", value: formatInr(Number(quote.baseAmount), { compact: true }) },
      ...(discount > 0
        ? [{ label: "Discount", value: `−${formatInr(discount, { compact: true })}` }]
        : []),
      { label: "Freight", value: formatInr(Number(quote.freightAmount), { compact: true }) },
      { label: `GST (${quote.taxRate}%)`, value: formatInr(Number(quote.taxAmount), { compact: true }) },
      { label: "Platform Fee", value: formatInr(Number(quote.platformFee), { compact: true }) },
      {
        label: "Insurance",
        value: quote.insuranceIncluded
          ? "Included"
          : formatInr(Number(quote.insuranceAmount), { compact: true }),
      },
    ];
  }, [quote]);

  async function handlePlace() {
    if (!quote || submitting) return;
    setSubmitting(true);
    setPriceChanged(false);
    try {
      const pr = await placeCustomerPurchaseRequest({
        quoteId: quote.quoteId,
        shippingAddressId: addressId || undefined,
        idempotencyKey: quote.quoteId,
      });
      toast.success(`Purchase request ${pr.referenceNumber} submitted`);
      router.push(ROUTES.purchaseRequests);
    } catch (cause) {
      const latest = checkoutLatestQuote(cause);
      if (latest) {
        setQuote(latest);
        setPriceChanged(true);
        toast.message("Price Updated", {
          description: "Availability or pricing has changed. Please review the latest quote.",
        });
      } else {
        toast.error(checkoutErrorMessage(cause, "Unable to place purchase request"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Checkout" description="Loading latest price..." />
      </PageContainer>
    );
  }

  if (error || !quote) {
    return (
      <PageContainer>
        <PageHeader title="Checkout" description={error ?? "Unable to load latest pricing"} />
        <Button className="mt-4" onClick={() => router.push(ROUTES.marketplace)}>
          Back to marketplace
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Checkout"
        description="Review the PetroTrade quote, then place a purchase request. Payment is not collected yet."
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          {priceChanged ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Price Updated. Availability or pricing has changed. Please review the latest quote.
            </div>
          ) : null}
          <h2 className="text-sm font-semibold text-slate-900">{quote.product.name}</h2>
          <p className="text-sm text-slate-500">
            {quote.grade?.displayName ?? quote.grade?.name ?? quote.product.code} · {quote.quantity} {quote.unit}
          </p>
          <p className="text-sm text-slate-500">Payment: {quote.paymentLabel}</p>
          {addresses.length > 0 ? (
            <label className="block text-sm text-slate-600">
              Shipping address
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                value={addressId}
                onChange={(event) => setAddressId(event.target.value)}
              >
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.label} — {address.city}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-sm text-slate-500">
              No saved shipping address. Freight uses the platform estimate until a destination is added.
            </p>
          )}
        </section>
        <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-semibold tabular-nums">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="font-semibold">Total Payable</span>
            <span className="text-lg font-bold tabular-nums text-brand">
              {formatInr(Number(quote.totalAmount), { compact: true })}
            </span>
          </div>
          <Button className="h-11 w-full" disabled={submitting} onClick={() => void handlePlace()}>
            {submitting ? "Submitting..." : "Verify & Place Purchase Request"}
          </Button>
        </aside>
      </div>
    </PageContainer>
  );
}

function CheckoutRouter() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");
  const router = useRouter();
  if (quoteId) {
    return <BuyNowCheckoutPage quoteId={quoteId} />;
  }
  return (
    <PageContainer>
      <PageHeader
        title="Checkout"
        description="Checkout requires a live PetroTrade quote. Open a product and tap Buy Now."
      />
      <Button className="mt-4" onClick={() => router.push(ROUTES.marketplace)}>
        Back to marketplace
      </Button>
    </PageContainer>
  );
}

export function CheckoutEntry() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <PageHeader title="Checkout" description="Loading latest price..." />
        </PageContainer>
      }
    >
      <CheckoutRouter />
    </Suspense>
  );
}
