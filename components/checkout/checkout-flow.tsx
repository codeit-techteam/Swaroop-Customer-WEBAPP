"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { commerceErrorCopy } from "@/lib/commerce-errors";
import {
  checkoutErrorCode,
  checkoutErrorMessage,
  checkoutHref,
  checkoutLatestQuote,
  createCustomerQuote,
  fetchCustomerCheckoutAddresses,
  fetchCustomerQuote,
  placeCustomerPurchaseRequest,
  quoteCartForCheckout,
  uniqueQuoteIds,
  type CartPriceChange,
  type CheckoutAddress,
  type CheckoutQuote,
} from "@/services/checkout";
import { useCartStore } from "@/store/cartStore";
import { formatCheckoutPackaging } from "./constants";
import { CheckoutSkeleton } from "./checkout-skeleton";
import {
  AddAddressDialog,
  AddressSelectSheet,
  CheckoutValidationDialog,
  NetworkErrorDialog,
  PriceUpdatedDialog,
  QuoteExpiredDialog,
} from "./dialogs";
import { IndustrialBanner } from "./industrial-banner";
import {
  OrderSummaryCard,
  type CheckoutOrderSummary,
  type CheckoutProductLine,
} from "./order-summary-card";
import { PaymentProtocolCard } from "./payment-protocol-card";
import { EmptyShippingCard, ShippingCard } from "./shipping-card";

function money(value: string | number | null | undefined): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function quoteExpiryLabel(expiresAt: string | null | undefined, now: number): string | null {
  if (!expiresAt) return null;
  const ends = new Date(expiresAt).getTime();
  if (!Number.isFinite(ends)) return null;
  const remaining = Math.max(0, ends - now);
  if (remaining <= 0) return "Quote expired — refresh pricing to continue";
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `Live quote expires in ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function purchaseRequestSuccessHref(input: {
  pr: { id: string; referenceNumber: string; status: string; responseDeadline?: string | null };
  quote: CheckoutQuote;
}): string {
  const params = new URLSearchParams({
    prId: input.pr.id,
    referenceNumber: input.pr.referenceNumber,
    status: input.pr.status,
    paymentOption: input.quote.paymentLabel,
    quantity: input.quote.quantity,
    unit: input.quote.unit,
    amount: input.quote.totalAmount,
    productName: input.quote.product.name,
    deadline: input.pr.responseDeadline ?? "",
  });
  return `${ROUTES.purchaseRequestsSuccess}?${params.toString()}`;
}

export function CheckoutFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteIdParam = searchParams.get("quoteId");
  const extraIds = searchParams.get("quoteIds");
  const placingRef = useRef(false);
  const fetchCart = useCartStore((state) => state.fetchCart);

  const [quotes, setQuotes] = useState<CheckoutQuote[]>([]);
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [priceChanges, setPriceChanges] = useState<CartPriceChange[]>([]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [validationIssue, setValidationIssue] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const quote = quotes[0] ?? null;

  const load = useCallback(
    async (ids: string[]) => {
      setLoading(true);
      setError(null);
      setErrorCode(null);
      try {
        let nextIds = ids;
        if (nextIds.length === 0) {
          const cartQuote = await quoteCartForCheckout();
          if (cartQuote.status === "INVALID" || !cartQuote.valid || cartQuote.quotes.length === 0) {
            const issue = cartQuote.issues[0];
            const copy = commerceErrorCopy(
              issue?.code ?? "CART_EMPTY",
              issue?.message,
            );
            setQuotes([]);
            setError(copy.message);
            setErrorCode(issue?.code ?? "CART_EMPTY");
            if (issue?.code && issue.code !== "CART_EMPTY") {
              setValidationIssue({ title: copy.title, message: copy.message });
            }
            return;
          }
          if (cartQuote.status === "PRICE_CHANGED" && cartQuote.changes.length > 0) {
            setPriceChanges(cartQuote.changes);
            setShowPriceModal(true);
          }
          nextIds = cartQuote.quotes.map((entry) => entry.quoteId);
          setQuotes(cartQuote.quotes);
          const nextAddresses = await fetchCustomerCheckoutAddresses();
          setAddresses(nextAddresses);
          setSelectedAddressId(
            cartQuote.quotes[0]?.shippingAddressId ??
              nextAddresses.find((row) => row.isDefault)?.id ??
              nextAddresses[0]?.id ??
              null,
          );
          if (nextIds[0]) {
            router.replace(checkoutHref(nextIds));
          }
          return;
        }

        const [loadedQuotes, nextAddresses] = await Promise.all([
          Promise.all(nextIds.map((id) => fetchCustomerQuote(id))),
          fetchCustomerCheckoutAddresses(),
        ]);
        setQuotes(loadedQuotes);
        setAddresses(nextAddresses);
        setSelectedAddressId(
          loadedQuotes[0]?.shippingAddressId ??
            nextAddresses.find((row) => row.isDefault)?.id ??
            nextAddresses[0]?.id ??
            null,
        );
      } catch (cause) {
        const code = checkoutErrorCode(cause);
        setError(checkoutErrorMessage(cause, "Unable to load latest pricing"));
        setErrorCode(code);
        if (code !== "QUOTE_EXPIRED") {
          setQuotes([]);
        }
        if (code === "QUOTE_EXPIRED") {
          setShowExpiredModal(true);
        } else if (code === "NETWORK_ERROR") {
          setShowNetworkModal(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    void load(uniqueQuoteIds(quoteIdParam, extraIds));
  }, [extraIds, load, quoteIdParam]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const shippingAddress = useMemo(
    () => addresses.find((row) => row.id === selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  const orderSummary = useMemo<CheckoutOrderSummary | null>(() => {
    if (quotes.length === 0) return null;
    const sum = (pick: (entry: CheckoutQuote) => string) =>
      quotes.reduce((total, entry) => total + money(pick(entry)), 0);
    return {
      baseSubtotal: sum((entry) => entry.baseAmount),
      discount: sum((entry) => entry.discountAmount),
      freight: sum((entry) => entry.freightAmount),
      freightLabel: shippingAddress
        ? `Freight (${shippingAddress.city})`
        : "Freight",
      gst: sum((entry) => entry.taxAmount),
      gstLabel: `GST (${quotes[0].taxRate}%)`,
      platformFee: sum((entry) => entry.platformFee),
      insuranceIncluded: quotes.every((entry) => entry.insuranceIncluded),
      insuranceAmount: sum((entry) => entry.insuranceAmount),
      totalPayable: sum((entry) => entry.totalAmount),
      totalQuantityMt: sum((entry) => entry.quantity),
    };
  }, [quotes, shippingAddress]);

  const productLines = useMemo<CheckoutProductLine[]>(
    () =>
      quotes.map((entry) => ({
        id: entry.quoteId,
        title: entry.product.name,
        subtitle:
          entry.grade?.displayName ?? entry.grade?.name ?? entry.product.code,
        quantityMt: money(entry.quantity),
        packaging: formatCheckoutPackaging(
          entry.product.packaging ?? "Bulk",
          money(entry.quantity),
        ),
      })),
    [quotes],
  );

  const expiresLabel = useMemo(
    () => quoteExpiryLabel(quote?.expiresAt, now),
    [quote?.expiresAt, now],
  );

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(ROUTES.cart);
  }, [router]);

  const refreshPricing = useCallback(async () => {
    const source = quote;
    setRefreshing(true);
    try {
      if (source) {
        const next = await createCustomerQuote({
          productId: source.productId,
          offerId: source.offerId,
          quantity: money(source.quantity),
          paymentOption: source.paymentOption,
          shippingAddressId: selectedAddressId ?? undefined,
        });
        setQuotes([next, ...quotes.slice(1)]);
        setShowExpiredModal(false);
        setError(null);
        setErrorCode(null);
        router.replace(checkoutHref([next.quoteId, ...quotes.slice(1).map((entry) => entry.quoteId)]));
        return;
      }
      await load(uniqueQuoteIds(quoteIdParam, extraIds));
      setShowExpiredModal(false);
    } catch (cause) {
      const code = checkoutErrorCode(cause);
      setError(checkoutErrorMessage(cause, "Unable to refresh pricing"));
      setErrorCode(code);
      if (code === "NETWORK_ERROR") setShowNetworkModal(true);
    } finally {
      setRefreshing(false);
    }
  }, [extraIds, load, quote, quoteIdParam, quotes, router, selectedAddressId]);

  const handlePlaceOrder = useCallback(async () => {
    if (quotes.length === 0 || placingRef.current) return;
    placingRef.current = true;
    setSubmitting(true);
    try {
      const results: Array<{
        pr: {
          id: string;
          referenceNumber: string;
          status: string;
          responseDeadline?: string | null;
        };
        quote: CheckoutQuote;
      }> = [];
      for (const entry of quotes) {
        const pr = await placeCustomerPurchaseRequest({
          quoteId: entry.quoteId,
          shippingAddressId: selectedAddressId ?? undefined,
          idempotencyKey: entry.quoteId,
        });
        results.push({ pr, quote: entry });
      }
      const first = results[0];
      void fetchCart();
      toast.success(`Purchase request ${first.pr.referenceNumber} submitted`);
      router.replace(purchaseRequestSuccessHref(first));
    } catch (cause) {
      const latest = checkoutLatestQuote(cause);
      const code = checkoutErrorCode(cause);
      if (latest) {
        const previous = quotes[0];
        setQuotes([latest, ...quotes.slice(1)]);
        if (previous && Number(previous.unitPrice) !== Number(latest.unitPrice)) {
          setPriceChanges([
            {
              cartItemId: latest.quoteId,
              productId: latest.productId,
              productName: latest.product.name,
              gradeName: latest.grade?.displayName ?? latest.grade?.name ?? null,
              oldUnitPrice: Number(previous.unitPrice),
              newUnitPrice: Number(latest.unitPrice),
              quantity: Number(latest.quantity),
              unit: latest.unit,
            },
          ]);
          setShowPriceModal(true);
        }
        router.replace(
          checkoutHref([latest.quoteId, ...quotes.slice(1).map((entry) => entry.quoteId)]),
        );
      } else if (code === "QUOTE_EXPIRED") {
        setShowExpiredModal(true);
      } else if (code === "NETWORK_ERROR") {
        setShowNetworkModal(true);
      } else {
        const copy = commerceErrorCopy(
          code,
          checkoutErrorMessage(cause, "Please try again."),
        );
        setValidationIssue({ title: copy.title, message: copy.message });
      }
    } finally {
      placingRef.current = false;
      setSubmitting(false);
    }
  }, [fetchCart, quotes, router, selectedAddressId]);

  if (loading) return <CheckoutSkeleton />;

  if (error || !quote || !orderSummary) {
    return (
      <PageContainer>
        <PageHeader
          title="Checkout"
          description={error ?? "Return to cart or product details and generate a new quote."}
          breadcrumbs={[
            { label: "Cart", href: ROUTES.cart },
            { label: "Checkout" },
          ]}
        />
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-card">
          <h2 className="text-lg font-semibold text-slate-900">
            {errorCode === "CART_EMPTY"
              ? "Nothing to check out yet"
              : errorCode === "UNAUTHORIZED"
                ? "Session expired"
                : "Unable to load latest pricing"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {error ?? "Return to the product or cart to get the latest price."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {errorCode === "CART_EMPTY" ? (
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => router.push(ROUTES.marketplace)}
              >
                Browse marketplace
              </Button>
            ) : errorCode === "UNAUTHORIZED" ? (
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => router.push(ROUTES.login)}
              >
                Sign in
              </Button>
            ) : (
              <Button
                className="rounded-xl bg-brand hover:bg-brand-700"
                onClick={() => void load(uniqueQuoteIds(quoteIdParam, extraIds))}
              >
                Retry
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => router.push(ROUTES.cart)}
            >
              Back to cart
            </Button>
          </div>
        </div>
        <QuoteExpiredDialog
          open={showExpiredModal}
          refreshing={refreshing}
          onClose={() => setShowExpiredModal(false)}
          onRefresh={() => void refreshPricing()}
        />
        <NetworkErrorDialog
          open={showNetworkModal}
          retrying={loading || refreshing}
          onClose={() => setShowNetworkModal(false)}
          onRetry={() => {
            setShowNetworkModal(false);
            void load(uniqueQuoteIds(quoteIdParam, extraIds));
          }}
        />
        <CheckoutValidationDialog
          open={Boolean(validationIssue)}
          title={validationIssue?.title ?? "Unable to continue"}
          message={validationIssue?.message ?? "Please try again."}
          onConfirm={() => setValidationIssue(null)}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Checkout"
        description="Review the live PetroTrade quote, confirm shipping, then place a purchase request. Payment is not collected yet."
        breadcrumbs={[
          { label: "Marketplace", href: ROUTES.marketplace },
          { label: "Cart", href: ROUTES.cart },
          { label: "Checkout" },
        ]}
        actions={
          <Button variant="outline" className="rounded-xl" onClick={handleBack}>
            Back
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-brand" />
        <span>
          Blind marketplace checkout — supplier identity stays with{" "}
          <strong className="font-semibold text-slate-800">PetroTrade Network</strong>
          {" · "}
          15-minute seller confirmation after placement
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {shippingAddress ? (
            <ShippingCard
              address={shippingAddress}
              onEditPress={() => setAddressSheetOpen(true)}
            />
          ) : (
            <EmptyShippingCard onAddPress={() => setAddAddressOpen(true)} />
          )}
          <PaymentProtocolCard />
          <IndustrialBanner />
        </div>

        <div className="space-y-4 pb-24 lg:sticky lg:top-24 lg:self-start lg:pb-0">
          <OrderSummaryCard
            products={productLines}
            summary={orderSummary}
            paymentLabel={quote.paymentLabel}
            expiresLabel={expiresLabel}
          />
          <div className="hidden lg:block">
            <Button
              className="h-12 w-full rounded-xl bg-brand text-[15px] hover:bg-brand-700"
              disabled={submitting}
              onClick={() => void handlePlaceOrder()}
            >
              {submitting ? "Submitting..." : "Verify & Place Purchase Request"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
              A purchase request is sent to matched sellers. Settlement happens
              after Proforma Invoice, based on {quote.paymentLabel}.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Button
          className="h-12 w-full rounded-xl bg-brand text-[15px] hover:bg-brand-700"
          disabled={submitting}
          onClick={() => void handlePlaceOrder()}
        >
          {submitting ? "Submitting..." : "Verify & Place Purchase Request"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <AddressSelectSheet
        open={addressSheetOpen}
        selectedId={selectedAddressId ?? ""}
        addresses={addresses}
        onOpenChange={setAddressSheetOpen}
        onSelect={(addressId) => {
          setSelectedAddressId(addressId);
          setAddressSheetOpen(false);
        }}
        onAddAddress={() => {
          setAddressSheetOpen(false);
          setAddAddressOpen(true);
        }}
      />
      <AddAddressDialog
        open={addAddressOpen}
        onOpenChange={setAddAddressOpen}
        onCreated={(address) => {
          setAddresses((prev) => {
            const without = prev.filter((row) => row.id !== address.id);
            return [address, ...without];
          });
          setSelectedAddressId(address.id);
        }}
      />
      <PriceUpdatedDialog
        open={showPriceModal}
        changes={priceChanges}
        onReview={() => setShowPriceModal(false)}
      />
      <QuoteExpiredDialog
        open={showExpiredModal}
        refreshing={refreshing}
        onClose={() => setShowExpiredModal(false)}
        onRefresh={() => void refreshPricing()}
      />
      <NetworkErrorDialog
        open={showNetworkModal}
        retrying={loading || refreshing}
        onClose={() => setShowNetworkModal(false)}
        onRetry={() => {
          setShowNetworkModal(false);
          void load(uniqueQuoteIds(quoteIdParam, extraIds));
        }}
      />
      <CheckoutValidationDialog
        open={Boolean(validationIssue)}
        title={validationIssue?.title ?? "Unable to continue"}
        message={validationIssue?.message ?? "Please try again."}
        onConfirm={() => setValidationIssue(null)}
      />
    </PageContainer>
  );
}
